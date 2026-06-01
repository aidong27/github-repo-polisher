import type { GitHubRepository } from '../types/repo';

function titleFromName(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function generateReadmeTemplate(repo: GitHubRepository): string {
  const projectTitle = titleFromName(repo.name);
  const demoUrl = repo.homepage || 'https://your-demo-url.example.com';
  const licenseName = repo.licenseName || 'MIT';
  const description =
    repo.description ||
    `${projectTitle} is a focused web project. Replace this sentence with the problem it solves, who it is for, and what makes it worth trying.`;

  return `# ${projectTitle}

${description}

## Demo

- Live demo: [${demoUrl}](${demoUrl})
- Repository: [${repo.fullName}](${repo.htmlUrl})

## Screenshots

Add screenshots or short GIFs that show the main workflow.

![${projectTitle} screenshot](./docs/screenshot.png)

## Features

- Clear primary workflow
- Responsive user interface
- Accessible controls and readable states
- Local-first setup for development

## Tech Stack

- Frontend: React, TypeScript, Vite
- Styling: CSS
- Tooling: ESLint, GitHub Actions

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Build for production:

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Project Structure

\`\`\`text
src/
  components/
  lib/
  styles/
  types/
\`\`\`

## Roadmap

- [ ] Add a public demo
- [ ] Add screenshots for the main workflow
- [ ] Expand automated checks
- [ ] Document contribution guidelines

## License

This project is licensed under the ${licenseName} License.`;
}
