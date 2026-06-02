import type { AnalysisResult, Suggestion, SuggestionPriority } from '../types/repo';
import { getRuleExplanation } from '../lib/ruleExplanations';
import { RuleDetails } from './RuleDetails';

interface SuggestionListProps {
  result: AnalysisResult;
}

const priorityOrder: SuggestionPriority[] = ['high', 'medium', 'optional'];

const priorityLabels: Record<SuggestionPriority, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  optional: 'Optional polish',
};

export function SuggestionList({ result }: SuggestionListProps) {
  return (
    <section className="panel" aria-labelledby="suggestions-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h2 id="suggestions-heading">Improvement plan</h2>
        </div>
        <span className="count-pill">{result.suggestions.length} items</span>
      </div>

      {result.suggestions.length === 0 ? (
        <p className="empty-state">This repository already covers the main open-source presentation basics.</p>
      ) : (
        <div className="suggestion-groups">
          {priorityOrder.map((priority) => {
            const suggestions = result.suggestions.filter((item) => item.priority === priority);

            if (suggestions.length === 0) {
              return null;
            }

            return (
              <div className="suggestion-group" key={priority}>
                <h3>{priorityLabels[priority]}</h3>
                <div className="suggestion-list">
                  {suggestions.map((suggestion) => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const explanation = getRuleExplanation(suggestion.id);

  return (
    <article className={`suggestion-card suggestion-${suggestion.priority}`}>
      <div className="suggestion-title-row">
        <h4>{suggestion.title}</h4>
        <span>{priorityLabels[suggestion.priority]}</span>
      </div>
      <p>
        <strong>Why it matters:</strong> {suggestion.reason}
      </p>
      <p>
        <strong>Suggested action:</strong> {suggestion.action}
      </p>
      <RuleDetails explanation={explanation} priority={suggestion.priority} />
    </article>
  );
}
