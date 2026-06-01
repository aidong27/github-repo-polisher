import { generateReadmeTemplate } from './readmeTemplate';
import type {
  AnalysisResult,
  ChecklistItem,
  ReadmeSignals,
  RepositoryData,
  ScoreCategory,
  Suggestion,
} from '../types/repo';

type SectionKey = keyof Omit<ReadmeSignals, 'hasImage' | 'hasInstallCommands'>;

const sectionPatterns: Record<SectionKey, RegExp[]> = {
  hasDemoSection: [
    /^#{1,6}\s*(demo|live demo|preview|try it|online demo)\b/im,
    /\b(vercel\.app|netlify\.app|github\.io|live demo)\b/i,
  ],
  hasScreenshotSection: [/^#{1,6}\s*(screenshots?|preview|gallery)\b/im],
  hasFeatureSection: [/^#{1,6}\s*(features?|highlights?)\b/im],
  hasTechStackSection: [/^#{1,6}\s*(tech stack|built with|technologies|stack)\b/im],
  hasGettingStartedSection: [
    /^#{1,6}\s*(getting started|installation|install|setup|quick start|local development)\b/im,
  ],
  hasRoadmapSection: [/^#{1,6}\s*(roadmap|future work|next steps)\b/im],
  hasLicenseSection: [/^#{1,6}\s*(license)\b/im],
  hasContributingSection: [/^#{1,6}\s*(contributing|contribution|development)\b/im],
};

export function analyzeRepository(data: RepositoryData): AnalysisResult {
  const readme = data.readme?.content || '';
  const signals = getReadmeSignals(readme);
  const hasPackageScripts = Boolean(
    data.packageJson &&
      (data.packageJson.scripts.dev ||
        data.packageJson.scripts.start ||
        data.packageJson.scripts.build),
  );

  const categories: ScoreCategory[] = [
    {
      id: 'readme',
      label: 'README completeness',
      max: 35,
      score:
        points(data.files.readme, 8) +
        points(signals.hasDemoSection, 4) +
        points(signals.hasImage || signals.hasScreenshotSection, 5) +
        points(signals.hasFeatureSection, 4) +
        points(signals.hasTechStackSection, 4) +
        points(signals.hasGettingStartedSection && signals.hasInstallCommands, 4) +
        points(signals.hasRoadmapSection, 3) +
        points(signals.hasLicenseSection, 3),
      description: 'Core README sections, visuals, and setup clarity.',
    },
    {
      id: 'metadata',
      label: 'Project metadata',
      max: 20,
      score:
        points(Boolean(data.repo.description), 7) +
        points(data.repo.topics.length > 0, 5) +
        points(Boolean(data.repo.homepage), 5) +
        points(Boolean(data.repo.fullName), 3),
      description: 'Repository description, topics, homepage, and identity.',
    },
    {
      id: 'engineering',
      label: 'Engineering files',
      max: 20,
      score:
        points(data.files.packageJson, 8) +
        points(data.files.workflows, 8) +
        points(hasPackageScripts, 4),
      description: 'Installable project metadata and CI signals.',
    },
    {
      id: 'showcase',
      label: 'Showcase readiness',
      max: 15,
      score:
        points(Boolean(data.repo.homepage) || signals.hasDemoSection, 5) +
        points(signals.hasImage || signals.hasScreenshotSection, 5) +
        points(signals.hasFeatureSection, 3) +
        points(Boolean(data.repo.description) && readme.trim().length > 80, 2),
      description: 'Demo, screenshots, and first-impression material.',
    },
    {
      id: 'opensource',
      label: 'Open-source friendliness',
      max: 10,
      score:
        points(data.files.license, 4) +
        points(signals.hasLicenseSection, 2) +
        points(data.files.contributing || signals.hasContributingSection, 3) +
        points(signals.hasRoadmapSection, 1),
      description: 'License, contribution path, and future direction.',
    },
  ];

  const checks = buildChecklist(data, signals, hasPackageScripts);
  const suggestions = buildSuggestions(data, signals, hasPackageScripts);
  const scoreTotal = categories.reduce((total, category) => total + category.score, 0);

  return {
    source: data.source,
    repo: data.repo,
    scoreTotal,
    categories,
    checks,
    missingItems: checks.filter((check) => !check.passed),
    suggestions,
    readmeSignals: signals,
    readmeTemplate: generateReadmeTemplate(data.repo),
    analyzedAt: new Date().toISOString(),
  };
}

function buildChecklist(
  data: RepositoryData,
  signals: ReadmeSignals,
  hasPackageScripts: boolean,
): ChecklistItem[] {
  return [
    item('readme-file', 'README', 'README file exists', data.files.readme, 'Required first stop for visitors.'),
    item('demo-section', 'README', 'Demo section or live link', signals.hasDemoSection, 'Helps visitors try the project quickly.'),
    item('screenshots-section', 'README', 'Screenshots or preview section', signals.hasScreenshotSection, 'Shows what the project looks like before cloning.'),
    item('features-section', 'README', 'Features section', signals.hasFeatureSection, 'Clarifies the core value of the project.'),
    item('tech-stack-section', 'README', 'Tech Stack section', signals.hasTechStackSection, 'Makes the implementation easy to scan.'),
    item('getting-started-section', 'README', 'Getting Started section', signals.hasGettingStartedSection, 'Reduces setup friction.'),
    item('readme-images', 'Showcase', 'README includes images', signals.hasImage, 'Visual proof improves trust and comprehension.'),
    item('install-commands', 'README', 'Install or run commands', signals.hasInstallCommands, 'Lets users reproduce the project locally.'),
    item('roadmap-section', 'Open source', 'Roadmap section', signals.hasRoadmapSection, 'Shows where the project is going.'),
    item('license-section', 'Open source', 'License section in README', signals.hasLicenseSection, 'Makes usage terms easy to find.'),
    item('repo-description', 'Project metadata', 'Repository description', Boolean(data.repo.description), 'Creates a clear GitHub card preview.'),
    item('repo-topics', 'Project metadata', 'Repository topics', data.repo.topics.length > 0, 'Improves discoverability on GitHub.'),
    item('repo-homepage', 'Project metadata', 'Homepage or demo URL', Boolean(data.repo.homepage), 'Turns visitors into users faster.'),
    item('license-file', 'Open source', 'LICENSE file', data.files.license, 'Defines legal usage clearly.'),
    item('package-json', 'Engineering', 'package.json file', data.files.packageJson, 'Signals how the app is installed and built.'),
    item('package-scripts', 'Engineering', 'dev/build scripts', hasPackageScripts, 'Makes project commands predictable.'),
    item('github-actions', 'Engineering', 'GitHub Actions workflow', data.files.workflows, 'Shows automated quality checks.'),
    item('contributing-guide', 'Open source', 'Contributing guide', data.files.contributing || signals.hasContributingSection, 'Gives outside contributors a path to help.'),
  ];
}

function buildSuggestions(
  data: RepositoryData,
  signals: ReadmeSignals,
  hasPackageScripts: boolean,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  addSuggestion(
    suggestions,
    !data.files.readme,
    'high',
    'Create a complete README',
    'The README is the landing page for every GitHub visitor and often decides whether they keep reading.',
    'Add a README with a short intro, screenshots, demo link, features, setup commands, roadmap, and license.',
  );
  addSuggestion(
    suggestions,
    data.files.readme && (!signals.hasGettingStartedSection || !signals.hasInstallCommands),
    'high',
    'Add reproducible setup commands',
    'A project that cannot be run quickly feels unfinished even when the code is good.',
    'Include npm install, npm run dev, npm run build, and any required environment notes.',
  );
  addSuggestion(
    suggestions,
    !data.files.license,
    'high',
    'Add a LICENSE file',
    'Without a license, other developers do not have clear permission to use or modify the code.',
    'Add MIT, Apache-2.0, GPL, or another license that matches your intent, then link it from the README.',
  );
  addSuggestion(
    suggestions,
    !data.repo.description,
    'medium',
    'Write a concise repository description',
    'GitHub shows this description in search, previews, and repository lists.',
    'Use one sentence that names the audience, workflow, and main benefit.',
  );
  addSuggestion(
    suggestions,
    data.repo.topics.length === 0,
    'medium',
    'Add GitHub topics',
    'Topics help people discover the repository through GitHub search and related project pages.',
    'Add framework, language, domain, and project-type tags such as react, typescript, cli, dashboard, or ai.',
  );
  addSuggestion(
    suggestions,
    !data.repo.homepage && !signals.hasDemoSection,
    'medium',
    'Expose a demo link',
    'A live demo shortens evaluation time and makes the project feel more complete.',
    'Deploy to GitHub Pages, Vercel, or Netlify, then add the link to the repository homepage and README.',
  );
  addSuggestion(
    suggestions,
    !signals.hasImage && !signals.hasScreenshotSection,
    'medium',
    'Add screenshots',
    'Screenshots communicate product shape faster than a paragraph of text.',
    'Add one desktop screenshot and one mobile screenshot under docs or assets, then embed them in the README.',
  );
  addSuggestion(
    suggestions,
    !data.files.packageJson || !hasPackageScripts,
    'medium',
    'Make project commands obvious',
    'Predictable scripts reduce guesswork for contributors and CI.',
    'Keep dev, build, preview, and lint scripts in package.json when the repository is a web project.',
  );
  addSuggestion(
    suggestions,
    !data.files.workflows,
    'optional',
    'Add a CI workflow',
    'Automated lint and build checks make the repository safer to accept contributions into.',
    'Add .github/workflows/ci.yml that runs npm ci, npm run lint, and npm run build on push and pull_request.',
  );
  addSuggestion(
    suggestions,
    !signals.hasRoadmapSection,
    'optional',
    'Document the roadmap',
    'A roadmap tells visitors whether the project is active and what kind of help is useful.',
    'Add a small checklist of near-term improvements and known gaps.',
  );
  addSuggestion(
    suggestions,
    !data.files.contributing && !signals.hasContributingSection,
    'optional',
    'Add contribution guidance',
    'Even a short guide reduces uncertainty for first-time contributors.',
    'Add CONTRIBUTING.md or a README section with setup, branch, issue, and pull request expectations.',
  );

  return suggestions;
}

function getReadmeSignals(readme: string): ReadmeSignals {
  return {
    hasDemoSection: hasAny(readme, sectionPatterns.hasDemoSection),
    hasScreenshotSection: hasAny(readme, sectionPatterns.hasScreenshotSection),
    hasFeatureSection: hasAny(readme, sectionPatterns.hasFeatureSection),
    hasTechStackSection: hasAny(readme, sectionPatterns.hasTechStackSection),
    hasGettingStartedSection: hasAny(readme, sectionPatterns.hasGettingStartedSection),
    hasRoadmapSection: hasAny(readme, sectionPatterns.hasRoadmapSection),
    hasLicenseSection: hasAny(readme, sectionPatterns.hasLicenseSection),
    hasContributingSection: hasAny(readme, sectionPatterns.hasContributingSection),
    hasImage: /!\[[^\]]*]\([^)]+\)|<img\s/i.test(readme),
    hasInstallCommands: /\b(npm|pnpm|yarn|bun)\s+(install|i)\b|\b(npm|pnpm|yarn|bun)\s+run\s+(dev|start|build|preview)\b/i.test(
      readme,
    ),
  };
}

function hasAny(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

function points(condition: boolean, value: number): number {
  return condition ? value : 0;
}

function item(
  id: string,
  group: ChecklistItem['group'],
  label: string,
  passed: boolean,
  detail: string,
): ChecklistItem {
  return { id, group, label, passed, detail };
}

function addSuggestion(
  suggestions: Suggestion[],
  condition: boolean,
  priority: Suggestion['priority'],
  title: string,
  reason: string,
  action: string,
): void {
  if (!condition) {
    return;
  }

  suggestions.push({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    priority,
    title,
    reason,
    action,
  });
}
