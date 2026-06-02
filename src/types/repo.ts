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

export type CategoryWeightMap = Record<ScoreCategoryId, number>;

export type ScoringPresetId =
  | 'general'
  | 'browser-app'
  | 'static-site'
  | 'javascript-typescript-library'
  | 'cli-tool'
  | 'documentation-site'
  | 'small-game-project';

export interface ScoringPreset {
  id: ScoringPresetId;
  label: string;
  description: string;
  focus: string;
  categoryWeights: CategoryWeightMap;
  suggestionPriorityOverrides?: Partial<Record<SuggestionId, SuggestionPriority>>;
}

export type CheckGroup =
  | 'README'
  | 'Project metadata'
  | 'Engineering'
  | 'Showcase'
  | 'Open source';

export type ChecklistRuleId =
  | 'readme-file'
  | 'demo-section'
  | 'screenshots-section'
  | 'features-section'
  | 'tech-stack-section'
  | 'getting-started-section'
  | 'readme-images'
  | 'install-commands'
  | 'roadmap-section'
  | 'license-section'
  | 'repo-description'
  | 'repo-topics'
  | 'repo-homepage'
  | 'license-file'
  | 'package-json'
  | 'package-scripts'
  | 'github-actions'
  | 'contributing-guide';

export interface ChecklistItem {
  id: ChecklistRuleId;
  group: CheckGroup;
  label: string;
  passed: boolean;
  detail: string;
  fix: string;
}

export type SuggestionPriority = 'high' | 'medium' | 'optional';

export type SuggestionId =
  | 'create-a-complete-readme'
  | 'add-reproducible-setup-commands'
  | 'add-a-license-file'
  | 'write-a-concise-repository-description'
  | 'add-github-topics'
  | 'expose-a-demo-link'
  | 'add-screenshots'
  | 'make-project-commands-obvious'
  | 'add-a-ci-workflow'
  | 'document-the-roadmap'
  | 'add-contribution-guidance';

export interface Suggestion {
  id: SuggestionId;
  priority: SuggestionPriority;
  title: string;
  reason: string;
  action: string;
}

export type AuditRuleId = ChecklistRuleId | SuggestionId;

export type RuleRequirement = 'required' | 'optional';

export interface RuleExplanation {
  checked: string;
  why: string;
  fix: string;
  priority: SuggestionPriority;
  requirement: RuleRequirement;
  heuristic: boolean;
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
  scoringPreset: ScoringPreset;
  scoreTotal: number;
  categories: ScoreCategory[];
  checks: ChecklistItem[];
  missingItems: ChecklistItem[];
  suggestions: Suggestion[];
  readmeSignals: ReadmeSignals;
  readmeTemplate: string;
  analyzedAt: string;
}
