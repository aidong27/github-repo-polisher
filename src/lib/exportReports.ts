import { getRuleExplanation } from './ruleExplanations';
import type {
  AnalysisResult,
  ChecklistItem,
  RuleExplanation,
  Suggestion,
  SuggestionPriority,
} from '../types/repo';

interface JsonRuleResult {
  id: ChecklistItem['id'];
  group: ChecklistItem['group'];
  label: string;
  passed: boolean;
  detail: string;
  fix: string;
  explanation: RuleExplanation;
}

interface JsonSuggestionResult {
  id: Suggestion['id'];
  priority: SuggestionPriority;
  title: string;
  reason: string;
  action: string;
  explanation: RuleExplanation;
}

interface JsonAuditReport {
  reportVersion: 1;
  generatedAt: string;
  source: AnalysisResult['source'];
  repository: {
    owner: string;
    name: string;
    fullName: string;
    url: string;
    description: string | null;
    topics: string[];
    homepage: string | null;
    licenseName: string | null;
    defaultBranch: string;
    stars: number;
    forks: number;
    updatedAt: string | null;
  };
  scoringPreset: {
    id: string;
    label: string;
    focus: string;
  };
  overallScore: {
    score: number;
    max: 100;
  };
  categoryScores: Array<{
    id: string;
    label: string;
    score: number;
    max: number;
    description: string;
  }>;
  rules: JsonRuleResult[];
  suggestions: JsonSuggestionResult[];
  readmeSignals: AnalysisResult['readmeSignals'];
  analyzedAt: string;
}

const priorityOrder: SuggestionPriority[] = ['high', 'medium', 'optional'];

const priorityHeadings: Record<SuggestionPriority, string> = {
  high: 'High priority recommendations',
  medium: 'Medium priority recommendations',
  optional: 'Optional polish recommendations',
};

export function buildMarkdownReport(
  result: AnalysisResult,
  generatedAt = new Date().toISOString(),
): string {
  const lines = [
    `# GitHub Repo Polisher Audit: ${result.repo.fullName}`,
    '',
    `- Repository: [${result.repo.fullName}](${result.repo.htmlUrl})`,
    `- Repository name: ${result.repo.name}`,
    `- Scoring preset: ${result.scoringPreset.label}`,
    `- Overall score: ${result.scoreTotal}/100`,
    `- Generated at: ${formatDateTime(generatedAt)}`,
    '',
    '## Category Scores',
    '',
    '| Category | Score | Notes |',
    '| --- | ---: | --- |',
    ...result.categories.map(
      (category) =>
        `| ${escapeMarkdownTableCell(category.label)} | ${category.score}/${category.max} | ${escapeMarkdownTableCell(category.description)} |`,
    ),
    '',
    `## Checklist Summary`,
    '',
    `- Passed checks: ${result.checks.length - result.missingItems.length}`,
    `- Missing checks: ${result.missingItems.length}`,
    '',
  ];

  for (const priority of priorityOrder) {
    lines.push(`## ${priorityHeadings[priority]}`, '');

    const suggestions = result.suggestions.filter((suggestion) => suggestion.priority === priority);

    if (suggestions.length === 0) {
      lines.push('None.', '');
      continue;
    }

    for (const suggestion of suggestions) {
      lines.push(`- **${suggestion.title}**`);
      lines.push(`  - Why: ${suggestion.reason}`);
      lines.push(`  - Action: ${suggestion.action}`);
    }

    lines.push('');
  }

  lines.push('---', 'Generated locally in the browser by GitHub Repo Polisher.');

  return lines.join('\n');
}

export function buildJsonReport(
  result: AnalysisResult,
  generatedAt = new Date().toISOString(),
): JsonAuditReport {
  return {
    reportVersion: 1,
    generatedAt,
    source: result.source,
    repository: {
      owner: result.repo.owner,
      name: result.repo.name,
      fullName: result.repo.fullName,
      url: result.repo.htmlUrl,
      description: result.repo.description,
      topics: result.repo.topics,
      homepage: result.repo.homepage,
      licenseName: result.repo.licenseName,
      defaultBranch: result.repo.defaultBranch,
      stars: result.repo.stars,
      forks: result.repo.forks,
      updatedAt: result.repo.updatedAt,
    },
    scoringPreset: {
      id: result.scoringPreset.id,
      label: result.scoringPreset.label,
      focus: result.scoringPreset.focus,
    },
    overallScore: {
      score: result.scoreTotal,
      max: 100,
    },
    categoryScores: result.categories.map((category) => ({
      id: category.id,
      label: category.label,
      score: category.score,
      max: category.max,
      description: category.description,
    })),
    rules: result.checks.map((check) => ({
      id: check.id,
      group: check.group,
      label: check.label,
      passed: check.passed,
      detail: check.detail,
      fix: check.fix,
      explanation: getRuleExplanation(check.id),
    })),
    suggestions: result.suggestions.map((suggestion) => ({
      id: suggestion.id,
      priority: suggestion.priority,
      title: suggestion.title,
      reason: suggestion.reason,
      action: suggestion.action,
      explanation: getRuleExplanation(suggestion.id),
    })),
    readmeSignals: result.readmeSignals,
    analyzedAt: result.analyzedAt,
  };
}

export function buildJsonReportText(
  result: AnalysisResult,
  generatedAt = new Date().toISOString(),
): string {
  return JSON.stringify(buildJsonReport(result, generatedAt), null, 2);
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
}

export async function copyTextToClipboard(content: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(content);
    return;
  } catch {
    copyTextWithSelectionFallback(content);
  }
}

export function getReportBaseFilename(result: AnalysisResult): string {
  return `${result.repo.fullName.replace(/[^a-z0-9._-]+/gi, '-').toLowerCase()}-audit`;
}

function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function copyTextWithSelectionFallback(content: string): void {
  const textarea = document.createElement('textarea');

  textarea.value = content;
  textarea.readOnly = true;
  textarea.style.position = 'fixed';
  textarea.style.inset = '0 auto auto 0';
  textarea.style.width = '1px';
  textarea.style.height = '1px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');

  textarea.remove();

  if (!copied) {
    throw new Error('Clipboard copy failed.');
  }
}
