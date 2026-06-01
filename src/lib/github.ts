import type {
  GitHubRepository,
  PackageJsonInfo,
  ParsedRepository,
  ReadmeFile,
  RepositoryData,
} from '../types/repo';

const API_ROOT = 'https://api.github.com';

interface GitHubRepoApiResponse {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  topics?: string[];
  homepage: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string | null;
  owner: {
    login: string;
  };
  license: {
    name: string;
    spdx_id: string;
  } | null;
}

interface GitHubContentFile {
  type: 'file';
  name: string;
  path: string;
  content?: string;
  encoding?: string;
}

interface GitHubContentDirectoryItem {
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  name: string;
  path: string;
}

type GitHubContentResponse = GitHubContentFile | GitHubContentDirectoryItem[];

interface GitHubApiMessage {
  message?: string;
}

export class GitHubApiError extends Error {
  readonly status?: number;
  readonly userMessage: string;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.userMessage = message;
  }
}

export function parseGitHubRepoUrl(input: string): ParsedRepository | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const value = trimmed.startsWith('github.com/') ? `https://${trimmed}` : trimmed;

  try {
    const url = new URL(value);
    const isGitHubHost = url.hostname.toLowerCase() === 'github.com';
    const segments = url.pathname
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (!isGitHubHost || segments.length < 2) {
      return null;
    }

    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/i, '');
    const ownerIsValid = /^[A-Za-z0-9-]+$/.test(owner);
    const repoIsValid = /^[A-Za-z0-9._-]+$/.test(repo);

    if (!ownerIsValid || !repoIsValid) {
      return null;
    }

    return { owner, repo };
  } catch {
    return null;
  }
}

export async function fetchRepositoryData(parsed: ParsedRepository): Promise<RepositoryData> {
  const repo = await fetchJson<GitHubRepoApiResponse>(
    `${API_ROOT}/repos/${parsed.owner}/${parsed.repo}`,
  );

  const [readmeContent, licenseFile, packageFile, workflows, contributingFile] =
    await Promise.all([
      fetchReadme(parsed.owner, parsed.repo),
      fetchFirstContentFile(parsed.owner, parsed.repo, [
        'LICENSE',
        'LICENSE.md',
        'LICENSE.txt',
        'COPYING',
      ]),
      fetchFirstContentFile(parsed.owner, parsed.repo, ['package.json']),
      fetchDirectory(parsed.owner, parsed.repo, '.github/workflows'),
      fetchFirstContentFile(parsed.owner, parsed.repo, [
        'CONTRIBUTING.md',
        '.github/CONTRIBUTING.md',
      ]),
    ]);

  const packageJson = packageFile ? parsePackageJson(packageFile.content || '') : null;
  const workflowFiles = workflows
    .filter((item) => item.type === 'file')
    .map((item) => item.name)
    .sort();

  return {
    source: 'github',
    fetchedAt: new Date().toISOString(),
    repo: normalizeRepository(repo),
    files: {
      readme: Boolean(readmeContent),
      license: Boolean(licenseFile),
      packageJson: Boolean(packageFile),
      workflows: workflowFiles.length > 0,
      contributing: Boolean(contributingFile),
      workflowFiles,
    },
    readme: readmeContent,
    packageJson,
  };
}

function normalizeRepository(repo: GitHubRepoApiResponse): GitHubRepository {
  const licenseName = repo.license
    ? repo.license.spdx_id && repo.license.spdx_id !== 'NOASSERTION'
      ? repo.license.spdx_id
      : repo.license.name
    : null;

  return {
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    description: repo.description,
    topics: repo.topics || [],
    homepage: repo.homepage || null,
    licenseName,
    defaultBranch: repo.default_branch,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  } catch {
    throw new GitHubApiError(
      'Unable to reach GitHub from this browser. Check the network connection, browser policy, or try the sample data.',
    );
  }

  if (!response.ok) {
    let apiMessage = '';

    try {
      const body = (await response.json()) as GitHubApiMessage;
      apiMessage = body.message ? ` GitHub says: ${body.message}` : '';
    } catch {
      apiMessage = '';
    }

    if (response.status === 403) {
      throw new GitHubApiError(
        `GitHub API access was blocked or rate limited.${apiMessage} You can continue with sample data.`,
        response.status,
      );
    }

    if (response.status === 404) {
      throw new GitHubApiError(
        `Repository not found or not public.${apiMessage} Check the URL and try again.`,
        response.status,
      );
    }

    throw new GitHubApiError(
      `GitHub API request failed with status ${response.status}.${apiMessage}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

async function fetchOptionalContent(
  owner: string,
  repo: string,
  path: string,
): Promise<GitHubContentResponse | null> {
  const safePath = path.split('/').map(encodeURIComponent).join('/');

  try {
    return await fetchJson<GitHubContentResponse>(
      `${API_ROOT}/repos/${owner}/${repo}/contents/${safePath}`,
    );
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

async function fetchFirstContentFile(
  owner: string,
  repo: string,
  paths: string[],
): Promise<GitHubContentFile | null> {
  for (const path of paths) {
    const content = await fetchOptionalContent(owner, repo, path);

    if (isContentFile(content)) {
      return content;
    }
  }

  return null;
}

async function fetchDirectory(
  owner: string,
  repo: string,
  path: string,
): Promise<GitHubContentDirectoryItem[]> {
  const content = await fetchOptionalContent(owner, repo, path);

  return Array.isArray(content) ? content : [];
}

async function fetchReadme(owner: string, repo: string): Promise<ReadmeFile | null> {
  try {
    const content = await fetchJson<GitHubContentFile>(
      `${API_ROOT}/repos/${owner}/${repo}/readme`,
    );

    if (!isContentFile(content) || !content.content) {
      return null;
    }

    return {
      path: content.path,
      content: decodeBase64(content.content),
    };
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

function isContentFile(content: GitHubContentResponse | null): content is GitHubContentFile {
  return content !== null && !Array.isArray(content) && content.type === 'file';
}

function parsePackageJson(content: string): PackageJsonInfo | null {
  if (!content) {
    return null;
  }

  try {
    const decoded = decodeBase64(content);
    const value = JSON.parse(decoded) as Partial<PackageJsonInfo>;

    return {
      name: typeof value.name === 'string' ? value.name : undefined,
      version: typeof value.version === 'string' ? value.version : undefined,
      scripts: isStringRecord(value.scripts) ? value.scripts : {},
      dependencies: isStringRecord(value.dependencies) ? value.dependencies : {},
      devDependencies: isStringRecord(value.devDependencies) ? value.devDependencies : {},
    };
  } catch {
    return null;
  }
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === 'string');
}

function decodeBase64(value: string): string {
  const normalized = value.replace(/\s/g, '');
  const binary = window.atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}
