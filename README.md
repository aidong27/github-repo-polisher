# GitHub Repo Polisher

GitHub Repo Polisher is a browser-only dashboard that audits a public GitHub repository and turns the result into practical README improvement suggestions.

It checks README coverage, repository metadata, engineering files, demo readiness, and open-source friendliness. It can call the public GitHub REST API without a token, and it also includes mock repositories for offline or rate-limited demos.

## Screenshots

Screenshot placeholders:

- `docs/screenshot-dashboard.png` - main score dashboard
- `docs/screenshot-readme-generator.png` - generated README template

Add real screenshots after the first deployment.

## Features

- Parse public GitHub URLs such as `https://github.com/user/repo`
- Fetch public repository metadata without storing tokens, cookies, or API keys
- Check for README, LICENSE, `package.json`, GitHub Actions, and contribution guidance
- Detect README sections for Demo, Screenshots, Features, Tech Stack, Getting Started, Roadmap, and License
- Detect screenshots and install/run commands in README content
- Score repositories across five categories for a total of 100 points
- Group recommendations by high priority, medium priority, and optional polish
- Generate a copy-ready README template based on the repository name
- Provide two built-in sample repositories for offline use
- Support dark mode and responsive layouts

## Tech Stack

- Vite
- React
- TypeScript
- Plain CSS
- GitHub public REST API
- ESLint
- GitHub Actions

## Local Development

```bash
npm install
npm run dev
```

Build and preview the production bundle:

```bash
npm run build
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Privacy

GitHub Repo Polisher is frontend-only. Repository analysis happens in the browser. The app does not upload analysis results to any server and does not contain or request API keys, tokens, cookies, or private credentials.

## Deploy to GitHub Pages

The Vite config uses `base: './'`, so the generated assets work under a repository subpath such as `https://user.github.io/github-repo-polisher/`.

One simple deployment path:

```bash
npm install
npm run build
```

Then publish the `dist` directory with your preferred GitHub Pages workflow or tool. For example, you can use `actions/deploy-pages` in a separate deployment workflow after the CI workflow passes.

Repository settings path:

1. Open the GitHub repository settings.
2. Go to Pages.
3. Choose GitHub Actions as the build and deployment source.
4. Add a Pages deployment workflow that uploads `dist`.

## Roadmap

- Add optional scoring presets for web apps, libraries, CLIs, and documentation sites
- Detect more ecosystem files such as `pnpm-lock.yaml`, `pyproject.toml`, and `Dockerfile`
- Add export to Markdown or JSON
- Add rule explanations with direct README patch suggestions
- Add GitHub Pages deployment workflow template generation

## License

MIT
