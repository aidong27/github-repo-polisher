# Contributing to GitHub Repo Polisher

Thanks for considering a contribution. This project is intended to stay lightweight, browser-only, and useful for small open-source maintainers.

## Project Goals

GitHub Repo Polisher helps maintainers understand whether a public repository is easy to evaluate at a glance. The tool focuses on first-impression quality:

- README clarity
- Demo readiness
- License and project metadata
- Screenshots and usage instructions
- CI and engineering hygiene
- Contribution and maintenance guidance

## Local Setup

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

## Contribution Types

Good first contributions include:

- Adding repository scoring rules
- Improving README section detection
- Adding mock repository fixtures
- Improving accessibility and keyboard navigation
- Writing example audit reports
- Improving documentation and screenshots

## Pull Request Guidelines

1. Keep pull requests focused on one topic.
2. Explain the user-facing problem, not only the code change.
3. Include screenshots or before-and-after notes for UI changes.
4. Update documentation when behavior changes.
5. Keep the default project experience simple and privacy-friendly.

## Design Principles

- Browser-first: the default experience should run locally in the user's browser.
- Public-repo friendly: the app should work with public repository information by default.
- Actionable over fancy: suggestions should help maintainers improve real repositories.
- Honest scoring: the tool should explain why points were lost and how to fix them.

## Issue Triage

When reporting a bug, please include:

- Repository URL being tested
- Browser and operating system
- Expected result
- Actual result
- Screenshot or console error if available

When requesting a feature, please include:

- The maintainer workflow it supports
- Example repository where it would help
- Any privacy or API-rate-limit concerns
