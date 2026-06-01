import type { RepositoryData } from '../types/repo';

const now = new Date().toISOString();

export const mockRepositories: RepositoryData[] = [
  {
    source: 'mock',
    fetchedAt: now,
    repo: {
      owner: 'example',
      name: 'weekend-widget',
      fullName: 'example/weekend-widget',
      htmlUrl: 'https://github.com/example/weekend-widget',
      description: null,
      topics: [],
      homepage: null,
      licenseName: null,
      defaultBranch: 'main',
      stars: 4,
      forks: 1,
      updatedAt: now,
    },
    files: {
      readme: true,
      license: false,
      packageJson: false,
      workflows: false,
      contributing: false,
      workflowFiles: [],
    },
    readme: {
      path: 'README.md',
      content: `# Weekend Widget

Small experiment.

TODO: explain setup later.`,
    },
    packageJson: null,
  },
  {
    source: 'mock',
    fetchedAt: now,
    repo: {
      owner: 'example',
      name: 'atlas-notes',
      fullName: 'example/atlas-notes',
      htmlUrl: 'https://github.com/example/atlas-notes',
      description: 'A polished note-taking dashboard for research-heavy teams.',
      topics: ['react', 'typescript', 'productivity', 'dashboard'],
      homepage: 'https://example.github.io/atlas-notes/',
      licenseName: 'MIT',
      defaultBranch: 'main',
      stars: 128,
      forks: 12,
      updatedAt: now,
    },
    files: {
      readme: true,
      license: true,
      packageJson: true,
      workflows: true,
      contributing: true,
      workflowFiles: ['ci.yml'],
    },
    readme: {
      path: 'README.md',
      content: `# Atlas Notes

A polished note-taking dashboard for research-heavy teams.

## Demo

Try the live demo at https://example.github.io/atlas-notes/.

## Screenshots

![Atlas Notes dashboard](./docs/screenshot.png)

## Features

- Fast search
- Linked notes
- Exportable collections

## Tech Stack

- React
- TypeScript
- Vite

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Roadmap

- Offline sync
- Team spaces

## Contributing

Issues and pull requests are welcome.

## License

MIT`,
    },
    packageJson: {
      name: 'atlas-notes',
      version: '1.0.0',
      scripts: {
        dev: 'vite',
        build: 'tsc -b && vite build',
        lint: 'eslint .',
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
      },
      devDependencies: {
        vite: '^6.0.5',
        typescript: '~5.7.2',
      },
    },
  },
];
