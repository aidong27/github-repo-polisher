import type { CategoryWeightMap, ScoringPreset, ScoringPresetId } from '../types/repo';

export const DEFAULT_SCORING_PRESET_ID: ScoringPresetId = 'general';

const generalWeights: CategoryWeightMap = {
  readme: 35,
  metadata: 20,
  engineering: 20,
  showcase: 15,
  opensource: 10,
};

export const scoringPresets: ScoringPreset[] = [
  {
    id: 'general',
    label: 'General / Default',
    description: 'Keeps the original balanced scoring model for most public repositories.',
    focus: 'Balanced README coverage, metadata, engineering signals, showcase, and open-source basics.',
    categoryWeights: generalWeights,
  },
  {
    id: 'browser-app',
    label: 'Browser App',
    description: 'Rewards demo readiness, screenshots, and repeatable frontend build commands.',
    focus: 'Live demo, screenshots, install/build scripts, and a clear first-run path.',
    categoryWeights: {
      readme: 28,
      metadata: 14,
      engineering: 22,
      showcase: 26,
      opensource: 10,
    },
    suggestionPriorityOverrides: {
      'expose-a-demo-link': 'high',
      'add-screenshots': 'high',
      'make-project-commands-obvious': 'high',
    },
  },
  {
    id: 'static-site',
    label: 'Static Site',
    description: 'Emphasizes published pages, preview material, and simple deployment clarity.',
    focus: 'Homepage URL, visual preview, README clarity, and lightweight release instructions.',
    categoryWeights: {
      readme: 30,
      metadata: 20,
      engineering: 10,
      showcase: 25,
      opensource: 15,
    },
    suggestionPriorityOverrides: {
      'expose-a-demo-link': 'high',
      'add-screenshots': 'high',
      'make-project-commands-obvious': 'optional',
    },
  },
  {
    id: 'javascript-typescript-library',
    label: 'JavaScript / TypeScript Library',
    description: 'Prioritizes package metadata, scripts, CI, license, and contribution confidence.',
    focus: 'Package setup, build/test signals, license clarity, and contributor onboarding.',
    categoryWeights: {
      readme: 30,
      metadata: 18,
      engineering: 28,
      showcase: 8,
      opensource: 14,
    },
    suggestionPriorityOverrides: {
      'make-project-commands-obvious': 'high',
      'add-a-ci-workflow': 'medium',
      'expose-a-demo-link': 'optional',
      'add-screenshots': 'optional',
    },
  },
  {
    id: 'cli-tool',
    label: 'CLI Tool',
    description: 'Favors installation instructions, commands, license, and contribution path.',
    focus: 'Install/run examples, package scripts, release confidence, and open-source hygiene.',
    categoryWeights: {
      readme: 32,
      metadata: 18,
      engineering: 25,
      showcase: 8,
      opensource: 17,
    },
    suggestionPriorityOverrides: {
      'add-reproducible-setup-commands': 'high',
      'make-project-commands-obvious': 'high',
      'add-screenshots': 'optional',
      'expose-a-demo-link': 'optional',
    },
  },
  {
    id: 'documentation-site',
    label: 'Documentation Site',
    description: 'Weights structure, navigation cues, screenshots, and published docs access.',
    focus: 'README completeness, live docs URL, roadmap, screenshots, and contribution guidance.',
    categoryWeights: {
      readme: 38,
      metadata: 16,
      engineering: 10,
      showcase: 22,
      opensource: 14,
    },
    suggestionPriorityOverrides: {
      'expose-a-demo-link': 'high',
      'document-the-roadmap': 'medium',
      'make-project-commands-obvious': 'optional',
    },
  },
  {
    id: 'small-game-project',
    label: 'Small Game Project',
    description: 'Looks hardest at playable demos, screenshots, and a direct description of the hook.',
    focus: 'Playable link, screenshots, project hook, quick-start steps, and lightweight license clarity.',
    categoryWeights: {
      readme: 25,
      metadata: 15,
      engineering: 15,
      showcase: 35,
      opensource: 10,
    },
    suggestionPriorityOverrides: {
      'expose-a-demo-link': 'high',
      'add-screenshots': 'high',
      'write-a-concise-repository-description': 'high',
      'make-project-commands-obvious': 'medium',
    },
  },
];

export function getScoringPreset(presetId: ScoringPresetId): ScoringPreset {
  return (
    scoringPresets.find((preset) => preset.id === presetId) ||
    scoringPresets.find((preset) => preset.id === DEFAULT_SCORING_PRESET_ID) ||
    scoringPresets[0]
  );
}
