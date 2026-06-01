export type DataSource = 'github' | 'mock';

export interface ParsedRepository {
  owner: string;
  repo: string;
}

export interface GitHubRepository {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  topics: string[];
  homepage: string | null;
  licenseName: string | null;
  defaultBranch: string;
  stars: number;
  forks: number;
  updatedAt: string | null;
}

export interface ReadmeFile {
  path: string;
  content: string;
}

export interface PackageJsonInfo {
  name?: string;
  version?: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface RepoFilePresence {
  readme: boolean;
  license: boolean;
  packageJson: boolean;
  workflows: boolean;
  contributing: boolean;
  workflowFiles: string[];
}

export interface RepositoryData {
  source: DataSource;
  fetchedAt: string;
  repo: GitHubRepository;
  files: RepoFilePresence;
  readme: ReadmeFile | null;
  packageJson: PackageJsonInfo | null;
}

export type ScoreCategoryId =
  | 'readme'
  | 'metadata'
  | 'engineering'
  | 'showcase'
  | 'opensource';

export interface ScoreCategory {
  id: ScoreCategoryId;
  label: string;
  max: number;
  score: number;
  description: string;
}

export type CheckGroup =
  | 'README'
  | 'Project metadata'
  | 'Engineering'
  | 'Showcase'
  | 'Open source';

export interface ChecklistItem {
  id: string;
  group: CheckGroup;
  label: string;
  passed: boolean;
  detail: string;
}

export type SuggestionPriority = 'high' | 'medium' | 'optional';

export interface Suggestion {
  id: string;
  priority: SuggestionPriority;
  title: string;
  reason: string;
  action: string;
}

export interface ReadmeSignals {
  hasDemoSection: boolean;
  hasScreenshotSection: boolean;
  hasFeatureSection: boolean;
  hasTechStackSection: boolean;
  hasGettingStartedSection: boolean;
  hasRoadmapSection: boolean;
  hasLicenseSection: boolean;
  hasContributingSection: boolean;
  hasImage: boolean;
  hasInstallCommands: boolean;
}

export interface AnalysisResult {
  source: DataSource;
  repo: GitHubRepository;
  scoreTotal: number;
  categories: ScoreCategory[];
  checks: ChecklistItem[];
  missingItems: ChecklistItem[];
  suggestions: Suggestion[];
  readmeSignals: ReadmeSignals;
  readmeTemplate: string;
  analyzedAt: string;
}
