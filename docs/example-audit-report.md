# Example Audit Report

This example shows how GitHub Repo Polisher should explain repository feedback to maintainers.

## Sample Repository

- Project type: browser app
- Audience: students and small open-source maintainers
- Goal: make the repository easier to evaluate in under one minute

## Summary Score

| Category | Score | Notes |
|---|---:|---|
| README coverage | 22 / 25 | Strong overview and setup instructions |
| Demo readiness | 14 / 20 | Demo link exists, screenshots are missing |
| Engineering files | 18 / 20 | License, package file, and CI are present |
| Open-source friendliness | 16 / 20 | Contribution guide exists, issue templates are planned |
| Maintenance signals | 10 / 15 | Changelog exists, release notes need more detail |
| Total | 80 / 100 | Good public release candidate |

## High Priority Suggestions

1. Add real screenshots captured from the running app.
2. Add a short demo walkthrough to the README.
3. Add a release note explaining what changed and how it was tested.

## Medium Priority Suggestions

1. Add issue templates for bug reports and feature requests.
2. Add example repositories that show different project types.
3. Explain which checks are direct file checks and which checks are heuristic.

## Optional Polish

1. Add a small architecture note for contributors.
2. Add exported Markdown and JSON examples.
3. Add accessibility notes for keyboard and screen-reader behavior.

## Maintainer Takeaway

The project is already understandable, but the next trust jump comes from proof: screenshots, demo link, changelog entries, and repeatable release checks.
