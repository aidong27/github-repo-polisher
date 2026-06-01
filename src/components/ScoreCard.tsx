import type { AnalysisResult, ScoreCategory } from '../types/repo';
import type { CSSProperties } from 'react';

interface ScoreCardProps {
  result: AnalysisResult;
}

export function ScoreCard({ result }: ScoreCardProps) {
  return (
    <section className="panel score-panel" aria-labelledby="score-heading">
      <div className="score-overview">
        <div>
          <p className="eyebrow">Repository score</p>
          <h2 id="score-heading">{result.scoreTotal}/100</h2>
          <p className="muted">{getScoreLabel(result.scoreTotal)}</p>
        </div>
        <div
          className="score-ring"
          role="img"
          aria-label={`Total score ${result.scoreTotal} out of 100`}
          style={{ '--score': `${result.scoreTotal}%` } as CSSProperties}
        >
          <span>{result.scoreTotal}</span>
        </div>
      </div>

      <div className="category-grid">
        {result.categories.map((category) => (
          <CategoryScore key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}

function CategoryScore({ category }: { category: ScoreCategory }) {
  const percent = Math.round((category.score / category.max) * 100);

  return (
    <article className="category-card">
      <div className="category-header">
        <h3>{category.label}</h3>
        <strong>
          {category.score}/{category.max}
        </strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={`${category.label}: ${category.score} out of ${category.max}`}
        aria-valuemin={0}
        aria-valuemax={category.max}
        aria-valuenow={category.score}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      <p>{category.description}</p>
    </article>
  );
}

function getScoreLabel(score: number): string {
  if (score >= 85) {
    return 'Excellent first impression.';
  }

  if (score >= 65) {
    return 'Solid, with visible polish gaps.';
  }

  if (score >= 40) {
    return 'Promising, but hard to evaluate quickly.';
  }

  return 'Needs core open-source presentation work.';
}
