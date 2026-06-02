import type { RuleExplanation, SuggestionPriority } from '../types/repo';

interface RuleDetailsProps {
  explanation: RuleExplanation;
  priority?: SuggestionPriority;
}

const priorityLabels: Record<SuggestionPriority, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  optional: 'Optional polish',
};

const requirementLabels: Record<RuleExplanation['requirement'], string> = {
  required: 'Required',
  optional: 'Optional',
};

export function RuleDetails({ explanation, priority }: RuleDetailsProps) {
  const displayedPriority = priority || explanation.priority;

  return (
    <details className="rule-details">
      <summary>Details</summary>
      <div className="rule-details-body">
        <div className="rule-detail-tags" aria-label="Rule metadata">
          <span>{priorityLabels[displayedPriority]}</span>
          <span>{requirementLabels[explanation.requirement]}</span>
          {explanation.heuristic ? <span>Heuristic</span> : <span>Direct check</span>}
        </div>
        <p>
          <strong>What was checked:</strong> {explanation.checked}
        </p>
        <p>
          <strong>Why it matters:</strong> {explanation.why}
        </p>
        <p>
          <strong>How to fix:</strong> {explanation.fix}
        </p>
      </div>
    </details>
  );
}
