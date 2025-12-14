# Expo SDK Documentation Guidance

**Last Updated**: 2025-11-29
**Current SDK**: 54

> **MANDATORY**: Follow these rules for ALL Expo/React Native work.

---

## Documentation References

| Resource | URL | When to Use |
|----------|-----|-------------|
| SDK 54 Changelog | https://expo.dev/changelog/sdk-54 | Check new features, breaking changes |
| Main Docs | https://docs.expo.dev | Primary reference for all APIs |
| Local Summary | `docs/expo-latest.md` | Quick pointer, defer to official docs |

---

## CLI Usage

**ALWAYS use:**
```bash
npx expo ...
```

**NEVER use:**
```bash
expo ...  # Deprecated expo-cli global
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `npx expo start` | Start development server |
| `npx expo install --fix` | Fix dependency versions |
| `npx expo install <package>` | Install compatible package |
| `npx expo prebuild` | Generate native projects |

---

## Version Compatibility

**Before adding/upgrading features:**

1. Check SDK release notes for compatibility
2. Run `npx expo install --fix` after changes
3. Validate against SDK 54 requirements

**Dependencies must be compatible with SDK 54.**

---

## Architecture

**USE:** New Architecture (default in SDK 54+)

**AVOID:**
- Legacy Architecture snippets
- Deprecated APIs from older tutorials
- Third-party blog examples (unless confirmed against official docs)

---

## Platform-Specific Guides

| Topic | Official Guide |
|-------|----------------|
| Build | EAS Build docs |
| Router | Expo Router v6 |
| Native Modules | New native modules guide |

**Do NOT rely on:**
- Third-party blogs (unless verified)
- Stack Overflow answers for older SDKs
- Tutorials using `expo-cli` globals

---

## Checklist Before Implementation

- [ ] Referenced latest Expo SDK 54 docs
- [ ] Using `npx expo` CLI (not deprecated global)
- [ ] Using New Architecture patterns
- [ ] Ran `npx expo install --fix` for version compatibility
- [ ] Checked official guides for platform specifics
