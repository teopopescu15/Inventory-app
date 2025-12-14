# Project Rules

Project-specific rules for Gym V2 Application. These rules are referenced by skills during implementation.

> **IMPORTANT**: Read the relevant rule files before implementing any code changes.

## Rule Files

| File | Description | When to Read |
|------|-------------|--------------|
| `expo-guidance.md` | Expo SDK documentation, CLI usage, version compatibility | Before any frontend/mobile work |
| `code-integrity.md` | Zero duplication policy, modify existing code | Before writing ANY code |
| `documentation-standards.md` | Docstring requirements, format, update protocol | When writing functions/classes |

## Which Skills Use Which Rules

| Skill | Rules |
|-------|-------|
| `brainstorming` | expo-guidance |
| `writing-plans` | expo-guidance, code-integrity |
| `executing-plans` | ALL |
| `subagent-driven-development` | ALL |
| `test-driven-development` | code-integrity, documentation-standards |
| `requesting-code-review` | code-integrity, documentation-standards |
| `receiving-code-review` | code-integrity |

## Updating Rules

When project standards change:
1. Update the relevant `.md` file in this directory
2. Skills automatically pick up the changes
3. No need to modify the skill SKILL.md files

## Quick Reference

### Code Integrity (code-integrity.md)
- NEVER create duplicate classes/schemas/endpoints
- ALWAYS modify existing production code
- ONE class, ONE responsibility, ONE implementation

### Expo Guidance (expo-guidance.md)
- Reference SDK 54 docs at https://docs.expo.dev
- Use `npx expo` CLI, not deprecated `expo-cli`
- Run `npx expo install --fix` for version compatibility

### Documentation (documentation-standards.md)
- Every class/method MUST have docstrings
- Include: description, args, returns, raises, main logic
- ALWAYS update docstring when code changes
