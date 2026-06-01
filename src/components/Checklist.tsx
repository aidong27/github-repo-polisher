import type { AnalysisResult, ChecklistItem } from '../types/repo';

interface ChecklistProps {
  result: AnalysisResult;
}

const groupOrder: ChecklistItem['group'][] = [
  'README',
  'Project metadata',
  'Engineering',
  'Showcase',
  'Open source',
];

export function Checklist({ result }: ChecklistProps) {
  return (
    <section className="panel" aria-labelledby="checklist-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Audit checklist</p>
          <h2 id="checklist-heading">Missing items and checks</h2>
        </div>
        <span className="count-pill">{result.missingItems.length} missing</span>
      </div>

      {result.missingItems.length > 0 ? (
        <div className="missing-list" aria-label="Missing items">
          {result.missingItems.map((item) => (
            <span key={item.id}>{item.label}</span>
          ))}
        </div>
      ) : (
        <p className="empty-state">No missing checklist items were detected.</p>
      )}

      <div className="check-groups">
        {groupOrder.map((group) => {
          const items = result.checks.filter((item) => item.group === group);

          return (
            <div className="check-group" key={group}>
              <h3>{group}</h3>
              <ul className="check-list">
                {items.map((item) => (
                  <li key={item.id} className={item.passed ? 'check-pass' : 'check-fail'}>
                    <div className="check-copy">
                      <strong>{item.label}</strong>
                      <p>{item.detail}</p>
                      <p className="check-fix">
                        <b>Guidance:</b> {item.fix}
                      </p>
                    </div>
                    <span className="check-status">{item.passed ? 'Present' : 'Missing'}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
