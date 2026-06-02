# Roadmap

GitHub Repo Polisher is a small open-source maintainer tool. The roadmap focuses on practical improvements that make public repositories easier to evaluate, run, and contribute to.

## Near Term

### Real screenshots and demo polish

- Capture dashboard screenshots from the actual running app.
- Add a short demo walkthrough to the README.
- Document which parts of the audit are heuristic and which are direct file checks.

### Scoring preset refinement

The app now includes optional scoring profiles for different repository types. Future work should tune the weights against more real examples:

- Browser app
- Static site
- JavaScript or TypeScript library
- CLI tool
- Documentation site
- Small game project

### Example audit reports

Create example reports that show how maintainers can improve a repository over time:

- Before audit
- Recommendation list
- After improvements
- Release-note summary

## Mid Term

### Export support refinement

- Add issue-plan export for GitHub Issues or project boards.
- Add before-and-after report examples for maintainers.
- Add direct README patch suggestions alongside the existing rule explanations.

## Long Term

### Repository comparison mode

Allow users to compare two public repositories and understand differences in documentation, demo readiness, and onboarding quality.

### Maintainer workflow mode

Turn the audit into a lightweight issue plan that maintainers can paste into GitHub Issues or project boards.

## Non-Goals

- The project should not require a backend for the default workflow.
- The project should not require private repository access.
- The project should not replace careful human review.
- The score should not pretend to measure code quality by itself.
