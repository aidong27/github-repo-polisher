import { generateReadmeTemplate } from './readmeTemplate';
import { DEFAULT_SCORING_PRESET_ID, getScoringPreset } from './scoringPresets';
import type {
  AnalysisResult,
  CategoryWeightMap,
  ChecklistItem,
  ChecklistRuleId,
  ReadmeSignals,
  RepositoryData,
  ScoreCategory,
  ScoringPreset,
  ScoringPresetId,
  Suggestion,
  SuggestionId,
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

export function analyzeRepository(
  data: RepositoryData,
  presetId: ScoringPresetId = DEFAULT_SCORING_PRESET_ID,
): AnalysisResult {
  const scoringPreset = getScoringPreset(presetId);
  const readme = data.readme?.content || '';
  const signals = getReadmeSignals(readme);
  const hasPackageScripts = Boolean(
    data.packageJson &&
      (data.packageJson.scripts.dev ||
        data.packageJson.scripts.start ||
        data.packageJson.scripts.build),
  );

  const categories = applyPresetWeights(
    [
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
    ],
    scoringPreset.categoryWeights,
  );

  const checks = buildChecklist(data, signals, hasPackageScripts);
  const suggestions = buildSuggestions(data, signals, hasPackageScripts, scoringPreset);
  const scoreTotal = categories.reduce((total, category) => total + category.score, 0);

  return {
    source: data.source,
    repo: data.repo,
    scoringPreset,
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
    item(
      'readme-file',
      'README',
      'README file exists',
      data.files.readme,
      'Required first stop for visitors.',
      'Add `README.md` at the repository root with the project purpose, setup, demo, roadmap, and license.',
    ),
    item(
      'demo-section',
      'README',
      'Demo section or live link',
      signals.hasDemoSection,
      'Helps visitors try the project quickly.',
      'Add a Demo section or repository homepage URL that points to a live build, preview, or hosted example.',
    ),
    item(
      'screenshots-section',
      'README',
      'Screenshots or preview section',
      signals.hasScreenshotSection,
      'Shows what the project looks like before cloning.',
      'Add a Screenshots or Preview section and embed real images from `docs/` or another tracked asset folder.',
    ),
    item(
      'features-section',
      'README',
      'Features section',
      signals.hasFeatureSection,
      'Clarifies the core value of the project.',
      'List the main user-facing workflows or capabilities in a short Features section.',
    ),
    item(
      'tech-stack-section',
      'README',
      'Tech Stack section',
      signals.hasTechStackSection,
      'Makes the implementation easy to scan.',
      'Add the primary framework, language, runtime, and tooling so contributors know what they are opening.',
    ),
    item(
      'getting-started-section',
      'README',
      'Getting Started section',
      signals.hasGettingStartedSection,
      'Reduces setup friction.',
      'Add a Getting Started, Installation, Setup, or Local Development section with the first-run path.',
    ),
    item(
      'readme-images',
      'Showcase',
      'README includes images',
      signals.hasImage,
      'Visual proof improves trust and comprehension.',
      'Embed at least one real screenshot, GIF, or image preview in the README.',
    ),
    item(
      'install-commands',
      'README',
      'Install or run commands',
      signals.hasInstallCommands,
      'Lets users reproduce the project locally.',
      'Include copy-pasteable commands such as `npm install`, `npm run dev`, and `npm run build`.',
    ),
    item(
      'roadmap-section',
      'Open source',
      'Roadmap section',
      signals.hasRoadmapSection,
      'Shows where the project is going.',
      'Add a short Roadmap, Future Work, or Next Steps section with realistic near-term tasks.',
    ),
    item(
      'license-section',
      'Open source',
      'License section in README',
      signals.hasLicenseSection,
      'Makes usage terms easy to find.',
      'Add a License section that names the license and links to the repository license file.',
    ),
    item(
      'repo-description',
      'Project metadata',
      'Repository description',
      Boolean(data.repo.description),
      'Creates a clear GitHub card preview.',
      'Write one concise GitHub description that names the project type, audience, and main benefit.',
    ),
    item(
      'repo-topics',
      'Project metadata',
      'Repository topics',
      data.repo.topics.length > 0,
      'Improves discoverability on GitHub.',
      'Add language, framework, domain, and project-type topics such as `react`, `typescript`, or `dashboard`.',
    ),
    item(
      'repo-homepage',
      'Project metadata',
      'Homepage or demo URL',
      Boolean(data.repo.homepage),
      'Turns visitors into users faster.',
      'Set the repository homepage to the live demo, docs site, or best public project URL.',
    ),
    item(
      'license-file',
      'Open source',
      'LICENSE file',
      data.files.license,
      'Defines legal usage clearly.',
      'Add a standard `LICENSE` file that matches how you want others to use the project.',
    ),
    item(
      'package-json',
      'Engineering',
      'package.json file',
      data.files.packageJson,
      'Signals how the app is installed and built.',
      'Add `package.json` for JavaScript projects so dependencies and scripts are discoverable.',
    ),
    item(
      'package-scripts',
      'Engineering',
      'dev/build scripts',
      hasPackageScripts,
      'Makes project commands predictable.',
      'Add clear `dev`, `start`, or `build` scripts so local setup and CI can share the same commands.',
    ),
    item(
      'github-actions',
      'Engineering',
      'GitHub Actions workflow',
      data.files.workflows,
      'Shows automated quality checks.',
      'Add a workflow under `.github/workflows/` that runs the project checks on push or pull request.',
    ),
    item(
      'contributing-guide',
      'Open source',
      'Contributing guide',
      data.files.contributing || signals.hasContributingSection,
      'Gives outside contributors a path to help.',
      'Add `CONTRIBUTING.md` or a README contribution section with setup, branch, and PR expectations.',
    ),
  ];
}

function buildSuggestions(
  data: RepositoryData,
  signals: ReadmeSignals,
  hasPackageScripts: boolean,
  scoringPreset: ScoringPreset,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  addSuggestion(
    suggestions,
    scoringPreset,
    'create-a-complete-readme',
    !data.files.readme,
    'high',
    'Create a complete README',
    'The README is the landing page for every GitHub visitor and often decides whether they keep reading.',
    'Add a README with a short intro, screenshots, demo link, features, setup commands, roadmap, and license.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'add-reproducible-setup-commands',
    data.files.readme && (!signals.hasGettingStartedSection || !signals.hasInstallCommands),
    'high',
    'Add reproducible setup commands',
    'A project that cannot be run quickly feels unfinished even when the code is good.',
    'Include npm install, npm run dev, npm run build, and any required environment notes.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'add-a-license-file',
    !data.files.license,
    'high',
    'Add a LICENSE file',
    'Without a license, other developers do not have clear permission to use or modify the code.',
    'Add MIT, Apache-2.0, GPL, or another license that matches your intent, then link it from the README.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'write-a-concise-repository-description',
    !data.repo.description,
    'medium',
    'Write a concise repository description',
    'GitHub shows this description in search, previews, and repository lists.',
    'Use one sentence that names the audience, workflow, and main benefit.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'add-github-topics',
    data.repo.topics.length === 0,
    'medium',
    'Add GitHub topics',
    'Topics help people discover the repository through GitHub search and related project pages.',
    'Add framework, language, domain, and project-type tags such as react, typescript, cli, dashboard, or ai.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'expose-a-demo-link',
    !data.repo.homepage && !signals.hasDemoSection,
    'medium',
    'Expose a demo link',
    'A live demo shortens evaluation time and makes the project feel more complete.',
    'Deploy to GitHub Pages, Vercel, or Netlify, then add the link to the repository homepage and README.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'add-screenshots',
    !signals.hasImage && !signals.hasScreenshotSection,
    'medium',
    'Add screenshots',
    'Screenshots communicate product shape faster than a paragraph of text.',
    'Add one desktop screenshot and one mobile screenshot under docs or assets, then embed them in the README.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'make-project-commands-obvious',
    !data.files.packageJson || !hasPackageScripts,
    'medium',
    'Make project commands obvious',
    'Predictable scripts reduce guesswork for contributors and CI.',
    'Keep dev, build, preview, and lint scripts in package.json when the repository is a web project.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'add-a-ci-workflow',
    !data.files.workflows,
    'optional',
    'Add a CI workflow',
    'Automated lint and build checks make the repository safer to accept contributions into.',
    'Add .github/workflows/ci.yml that runs npm ci, npm run lint, and npm run build on push and pull_request.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'document-the-roadmap',
    !signals.hasRoadmapSection,
    'optional',
    'Document the roadmap',
    'A roadmap tells visitors whether the project is active and what kind of help is useful.',
    'Add a small checklist of near-term improvements and known gaps.',
  );
  addSuggestion(
    suggestions,
    scoringPreset,
    'add-contribution-guidance',
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

function applyPresetWeights(
  categories: ScoreCategory[],
  categoryWeights: CategoryWeightMap,
): ScoreCategory[] {
  return categories.map((category) => {
    const max = categoryWeights[category.id];
    const score = category.max > 0 ? Math.round((category.score / category.max) * max) : 0;

    return {
      ...category,
      max,
      score: Math.min(score, max),
    };
  });
}

function item(
  id: ChecklistRuleId,
  group: ChecklistItem['group'],
  label: string,
  passed: boolean,
  detail: string,
  fix: string,
): ChecklistItem {
  return { id, group, label, passed, detail, fix };
}

function addSuggestion(
  suggestions: Suggestion[],
  scoringPreset: ScoringPreset,
  id: SuggestionId,
  condition: boolean,
  priority: Suggestion['priority'],
  title: string,
  reason: string,
  action: string,
): void {
  if (!condition) {
    return;
  }

  const presetPriority = scoringPreset.suggestionPriorityOverrides?.[id];

  suggestions.push({
    id,
    priority: presetPriority || priority,
    title,
    reason,
    action,
  });
}
