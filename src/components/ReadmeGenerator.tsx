import { useState } from 'react';
import type { AnalysisResult } from '../types/repo';

interface ReadmeGeneratorProps {
  result: AnalysisResult;
}

export function ReadmeGenerator({ result }: ReadmeGeneratorProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.readmeTemplate);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
    }
  }

  return (
    <section className="panel readme-panel" aria-labelledby="readme-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">README generator</p>
          <h2 id="readme-heading">Copy-ready template</h2>
        </div>
        <button className="secondary-button" type="button" onClick={handleCopy} aria-label="Copy README template">
          {copyState === 'copied' ? 'Copied' : 'Copy template'}
        </button>
      </div>
      {copyState === 'failed' ? (
        <p className="inline-alert" role="status">
          Clipboard access failed. Select the template text and copy it manually.
        </p>
      ) : null}
      <textarea
        className="readme-template"
        aria-label="Generated README template"
        readOnly
        value={result.readmeTemplate}
      />
    </section>
  );
}
