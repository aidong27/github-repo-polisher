import { Fragment, useEffect, useMemo, useState } from 'react';
import { Checklist } from './components/Checklist';
import { PresetSelector } from './components/PresetSelector';
import { ReadmeGenerator } from './components/ReadmeGenerator';
import { RepoInput } from './components/RepoInput';
import { ScoreCard } from './components/ScoreCard';
import { SuggestionList } from './components/SuggestionList';
import { ThemeToggle } from './components/ThemeToggle';
import { analyzeRepository } from './lib/analyzer';
import { GitHubApiError, fetchRepositoryData, parseGitHubRepoUrl } from './lib/github';
import { mockRepositories } from './lib/mockData';
import { DEFAULT_SCORING_PRESET_ID } from './lib/scoringPresets';
import type { RepositoryData, ScoringPresetId } from './types/repo';

type Theme = 'light' | 'dark';

export function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [repositoryData, setRepositoryData] = useState<RepositoryData>(() => mockRepositories[1]);
  const [scoringPresetId, setScoringPresetId] = useState<ScoringPresetId>(
    DEFAULT_SCORING_PRESET_ID,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const result = useMemo(
    () => analyzeRepository(repositoryData, scoringPresetId),
    [repositoryData, scoringPresetId],
  );

  const repositoryMeta = useMemo(() => {
    const updated = result.repo.updatedAt
      ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
          new Date(result.repo.updatedAt),
        )
      : 'Unknown update date';

    return [
      `${result.repo.stars.toLocaleString()} stars`,
      `${result.repo.forks.toLocaleString()} forks`,
      `Default branch: ${result.repo.defaultBranch}`,
      `Updated: ${updated}`,
    ];
  }, [result.repo.defaultBranch, result.repo.forks, result.repo.stars, result.repo.updatedAt]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('repo-polisher-theme', theme);
  }, [theme]);

  async function handleAnalyze(input: string) {
    const parsed = parseGitHubRepoUrl(input);

    if (!parsed) {
      setError('Enter a public GitHub repository URL such as https://github.com/owner/repo.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchRepositoryData(parsed);
      setRepositoryData(data);
    } catch (caughtError) {
      setError(getFriendlyError(caughtError));
    } finally {
      setIsLoading(false);
    }
  }

  function handleUseMock(index: number) {
    setError(null);
    setRepositoryData(mockRepositories[index]);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="GitHub Repo Polisher home">
          <span className="brand-mark" aria-hidden="true">
            RP
          </span>
          <span>GitHub Repo Polisher</span>
        </a>
        <ThemeToggle
          theme={theme}
          onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        />
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Open-source repository dashboard</p>
            <h1>Polish a GitHub repo before visitors bounce.</h1>
            <p className="hero-text">
              Paste a public repository URL to audit README coverage, project metadata,
              engineering files, showcase quality, and open-source friendliness. Analysis stays
              in this browser.
            </p>
            <RepoInput disabled={isLoading} onSubmit={handleAnalyze} onUseMock={handleUseMock} />
            {error ? (
              <div className="error-box" role="alert">
                <strong>Analysis failed</strong>
                <p>{error}</p>
                <button type="button" className="secondary-button" onClick={() => handleUseMock(1)}>
                  Use sample data
                </button>
              </div>
            ) : null}
          </div>

          <aside className="hero-panel" aria-label="Scoring model">
            <div className="hero-panel-header">
              <span>Audit model</span>
              <strong>100 pts</strong>
            </div>
            <div className="hero-metrics">
              {result.categories.map((category) => (
                <Fragment key={category.id}>
                  <span>{category.label.replace(' completeness', '').replace(' files', '')}</span>
                  <strong>{category.max}</strong>
                </Fragment>
              ))}
            </div>
          </aside>
        </section>

        <section className="result-header" aria-labelledby="result-heading">
          <div>
            <p className="eyebrow">{result.source === 'mock' ? 'Sample analysis' : 'GitHub analysis'}</p>
            <h2 id="result-heading">{result.repo.fullName}</h2>
            <p>{result.repo.description || 'No repository description detected.'}</p>
          </div>
          <div className="result-actions">
            {result.repo.homepage ? (
              <a className="secondary-button link-button" href={result.repo.homepage} target="_blank" rel="noreferrer">
                Demo
              </a>
            ) : null}
            <a className="primary-button link-button" href={result.repo.htmlUrl} target="_blank" rel="noreferrer">
              Open repo
            </a>
          </div>
        </section>

        <div className="meta-strip" aria-label="Repository metadata">
          {repositoryMeta.map((item) => (
            <span key={item}>{item}</span>
          ))}
          {result.repo.topics.length > 0 ? (
            <span>Topics: {result.repo.topics.slice(0, 5).join(', ')}</span>
          ) : (
            <span>No topics detected</span>
          )}
        </div>

        <PresetSelector selectedPresetId={scoringPresetId} onChange={setScoringPresetId} />

        <ScoreCard result={result} />

        <div className="content-grid">
          <Checklist result={result} />
          <SuggestionList result={result} />
        </div>

        <ReadmeGenerator result={result} />
      </main>
    </div>
  );
}

function getInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem('repo-polisher-theme');

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getFriendlyError(error: unknown): string {
  if (error instanceof GitHubApiError) {
    return error.userMessage;
  }

  return 'Something unexpected happened while reading the public repository. You can still explore the tool with sample data.';
}
