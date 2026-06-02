import { useState } from 'react';
import {
  buildJsonReportText,
  buildMarkdownReport,
  copyTextToClipboard,
  downloadTextFile,
  getReportBaseFilename,
} from '../lib/exportReports';
import type { AnalysisResult } from '../types/repo';

interface ExportPanelProps {
  result: AnalysisResult;
}

type ExportState = {
  status: 'idle' | 'success' | 'failed';
  message: string;
  fallbackMarkdown?: string;
};

const idleState: ExportState = { status: 'idle', message: '' };

export function ExportPanel({ result }: ExportPanelProps) {
  const [exportState, setExportState] = useState<ExportState>(idleState);

  async function handleCopyMarkdown() {
    const generatedAt = new Date().toISOString();
    const markdownReport = buildMarkdownReport(result, generatedAt);

    try {
      await copyTextToClipboard(markdownReport);
      showMessage({ status: 'success', message: 'Markdown report copied.' });
    } catch {
      showMessage({
        status: 'failed',
        message: 'Clipboard access failed. Select the Markdown report below or download it.',
        fallbackMarkdown: markdownReport,
      });
    }
  }

  function handleDownloadMarkdown() {
    try {
      const generatedAt = new Date().toISOString();
      const filename = `${getReportBaseFilename(result)}.md`;

      downloadTextFile(filename, buildMarkdownReport(result, generatedAt), 'text/markdown');
      showMessage({ status: 'success', message: 'Markdown report download started.' });
    } catch {
      showMessage({
        status: 'failed',
        message: 'Markdown download could not start. Try copying the report instead.',
      });
    }
  }

  function handleDownloadJson() {
    try {
      const generatedAt = new Date().toISOString();
      const filename = `${getReportBaseFilename(result)}.json`;

      downloadTextFile(filename, buildJsonReportText(result, generatedAt), 'application/json');
      showMessage({ status: 'success', message: 'JSON report download started.' });
    } catch {
      showMessage({
        status: 'failed',
        message: 'JSON download could not start. Try again after refreshing the page.',
      });
    }
  }

  function showMessage(nextState: ExportState) {
    setExportState(nextState);

    if (nextState.status === 'success') {
      window.setTimeout(() => setExportState(idleState), 2200);
    }
  }

  return (
    <section className="panel export-panel" aria-labelledby="export-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Export</p>
          <h2 id="export-heading">Save this audit result</h2>
        </div>
        <div className="export-actions" aria-label="Export report actions">
          <button className="secondary-button" type="button" onClick={handleCopyMarkdown}>
            Copy Markdown
          </button>
          <button className="secondary-button" type="button" onClick={handleDownloadMarkdown}>
            Download Markdown
          </button>
          <button className="secondary-button" type="button" onClick={handleDownloadJson}>
            Download JSON
          </button>
        </div>
      </div>
      <p className="export-note">Reports are generated locally in this browser. No audit data is uploaded.</p>
      {exportState.status !== 'idle' ? (
        <p
          className={exportState.status === 'failed' ? 'inline-alert' : 'inline-success'}
          role={exportState.status === 'failed' ? 'alert' : 'status'}
        >
          {exportState.message}
        </p>
      ) : null}
      {exportState.fallbackMarkdown ? (
        <textarea
          className="export-fallback"
          aria-label="Markdown report fallback"
          readOnly
          value={exportState.fallbackMarkdown}
        />
      ) : null}
    </section>
  );
}
