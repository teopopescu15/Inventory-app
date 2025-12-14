---
name: app-test
description: Comprehensive Expo mobile app testing skill using Playwright MCP. Use this skill when testing new features, design changes, responsiveness, or verifying Docker container synchronization. This skill performs READ-ONLY testing with NO code modifications. Triggers include: (1) Testing new feature implementation, (2) Verifying UI/UX design changes, (3) Checking responsiveness across devices, (4) Validating Docker container code sync, (5) Debugging console errors or warnings, (6) End-to-end flow testing, (7) Pre-deployment verification.
---

# App Test Skill

Comprehensive testing skill for the Gym V2 Expo mobile app. Performs browser-based testing using Playwright MCP, console analysis, responsiveness verification, and Docker container synchronization checks.

## Critical Rules

1. **READ-ONLY MODE**: Never modify any code. Only test and report findings.
2. **RUN AS AGENT**: Execute this skill using `general-purpose` agent via Task tool.
3. **COMPLETE ALL PHASES**: Never skip phases unless explicitly told.
4. **SAVE ARTIFACTS**: All screenshots/traces go to `ARTIFACTS_PATH` (see env.md).

## Environment Variables

> **IMPORTANT**: Before using this skill, read `./env.md` for current environment values.
> All URLs and paths in this document use variable names. Replace them with actual values from `./env.md`.

| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Expo Web app URL |
| `BACKEND_URL` | Backend API URL |
| `BACKEND_HEALTH` | Backend health check endpoint |
| `AUTH_ENDPOINT` | Authentication token endpoint |
| `ARTIFACTS_PATH` | Screenshot storage path |
| `TEST_EMAIL` | Test account email |
| `TEST_PASSWORD` | Test account password |

## Test Credentials

For any page requiring authentication (unless testing register flow), use values from `./env.md`:

```
Email: TEST_EMAIL (see env.md)
Password: TEST_PASSWORD (see env.md)
```

**Important**: Only create new accounts when testing the registration flow itself.

## Environment Configuration

> See `./env.md` for current values

| Setting | Variable | Description |
|---------|----------|-------------|
| Expo Web URL | `FRONTEND_URL` | See env.md for current value |
| Backend API | `BACKEND_URL` | See env.md for current value |
| Artifacts Path | `ARTIFACTS_PATH` | `.playwright/traces/` |
| Containers | - | `db`, `backend`, `mobile` |

## Playwright MCP Tools Reference

See [references/playwright-tools.md](references/playwright-tools.md) for complete tool documentation.

### Quick Reference

| Category | Tools | When to Use |
|----------|-------|-------------|
| **Navigation** | `browser_navigate`, `browser_navigate_back`, `browser_tabs` | Navigate to pages, manage tabs |
| **Snapshots** | `browser_snapshot`, `browser_take_screenshot` | Capture page state and visuals |
| **Interaction** | `browser_click`, `browser_type`, `browser_fill_form`, `browser_hover` | User interactions |
| **Verification** | `browser_console_messages`, `browser_network_requests`, `browser_evaluate` | Check console, network, state |
| **Responsive** | `browser_resize` | Test different screen sizes |
| **Waiting** | `browser_wait_for` | Wait for elements/text |

## Testing Protocol: 7 Phases

Execute all phases sequentially. Document findings for each phase.

### Phase 1: Environment Verification

Verify all services are running before testing.

```bash
# Check Docker containers
docker-compose ps

# Expected: db, backend, mobile all "Up"
```

```bash
# Check container health
docker-compose logs --tail=20 backend
docker-compose logs --tail=20 mobile
```

**Pass Criteria**: All 3 containers running, no error logs.

### Phase 2: App Accessibility Check

Verify Expo app is accessible via Playwright.

```javascript
// Navigate to app (use FRONTEND_URL from env.md)
browser_navigate({ url: "FRONTEND_URL" })

// Take initial snapshot
browser_snapshot({})

// Check for load errors
browser_console_messages({})
```

**Pass Criteria**: Page loads, no critical console errors.

### Phase 3: Authentication (If Required)

Skip only if testing the register flow.

```javascript
// Navigate to login (use FRONTEND_URL from env.md)
browser_navigate({ url: "FRONTEND_URL" })

// Wait for login form
browser_wait_for({ text: "Login", timeout: 10000 })

// Take snapshot to find form elements
browser_snapshot({})

// Fill credentials using refs from snapshot (use TEST_EMAIL from env.md)
browser_type({
  element: "Email input field",
  ref: "[ref-from-snapshot]",
  text: "TEST_EMAIL"
})

// Use TEST_PASSWORD from env.md
browser_type({
  element: "Password input field",
  ref: "[ref-from-snapshot]",
  text: "TEST_PASSWORD"
})

// Click login button
browser_click({
  element: "Login button",
  ref: "[ref-from-snapshot]"
})

// Wait for successful login
browser_wait_for({ text: "Workout", timeout: 10000 })
```

**Pass Criteria**: Successfully logged in, redirected to main app.

### Phase 4: Feature/Design Testing

Test the specific feature or design being verified.

```javascript
// Navigate to feature page (use FRONTEND_URL from env.md)
browser_navigate({ url: "FRONTEND_URL/[feature-path]" })

// Capture page structure
browser_snapshot({})

// Take screenshot for visual verification (use ARTIFACTS_PATH from env.md)
browser_take_screenshot({
  filename: "ARTIFACTS_PATH/feature-[name]-desktop.png"
})

// Test interactions specific to feature
// [Feature-specific interactions]

// Verify expected elements exist
browser_snapshot({})
```

**Document**:
- Expected elements present/missing
- Visual design matches requirements
- Interactions work correctly
- Animations/transitions smooth

### Phase 5: Console & Error Analysis

Check for JavaScript errors, warnings, and issues.

```javascript
// Get all console messages
browser_console_messages({})

// Check for errors only
browser_console_messages({ onlyErrors: true })
```

**Classification**:
| Level | Action |
|-------|--------|
| `error` | **FAIL** - Must be fixed |
| `warning` | **WARN** - Should review |
| `log/info` | **INFO** - Note if relevant |

**Pass Criteria**: Zero errors. Warnings documented.

### Phase 6: Responsiveness Testing

Test across standard device sizes. Use `ARTIFACTS_PATH` from env.md for screenshot paths.

```javascript
// Mobile (iPhone SE)
browser_resize({ width: 375, height: 667 })
browser_take_screenshot({ filename: "ARTIFACTS_PATH/responsive-mobile.png" })
browser_snapshot({})

// Tablet (iPad)
browser_resize({ width: 768, height: 1024 })
browser_take_screenshot({ filename: "ARTIFACTS_PATH/responsive-tablet.png" })
browser_snapshot({})

// Desktop
browser_resize({ width: 1920, height: 1080 })
browser_take_screenshot({ filename: "ARTIFACTS_PATH/responsive-desktop.png" })
browser_snapshot({})
```

**Check for each size**:
- Layout breaks
- Overflow issues
- Text truncation
- Touch target sizes (mobile)
- Navigation accessibility

### Phase 7: Container Code Verification

Verify Docker containers have latest code and no errors.

```bash
# Check backend container for recent changes
docker-compose exec backend grep -r "[feature-keyword]" /app --include="*.py" | head -20

# Check mobile container for recent changes
docker-compose exec mobile grep -r "[feature-keyword]" /app --include="*.js" --include="*.tsx" | head -20

# Check backend logs for errors
docker-compose logs backend --tail=50 2>&1 | grep -i "error\|exception\|traceback"

# Check mobile/metro logs for errors
docker-compose logs mobile --tail=50 2>&1 | grep -i "error\|failed\|exception"

# Check database connectivity
docker-compose exec backend python -c "from database import engine; print('DB OK')" 2>&1
```

**Verify**:
- Code changes present in containers
- No runtime errors in logs
- Database connection working
- API endpoints responding

```bash
# Test backend health (use BACKEND_HEALTH from env.md)
curl -s BACKEND_HEALTH | head -5

# Test specific endpoint if applicable (use AUTH_ENDPOINT from env.md)
curl -s AUTH_ENDPOINT -X POST -d "username=test" 2>&1 | head -5
```

## Output Report Format

After completing all phases, generate this report:

```markdown
## App Test Report: [Feature/Test Name]
**Date**: [timestamp]
**Tester**: app-test skill (Playwright MCP)

---

### Phase 1: Environment
| Container | Status | Notes |
|-----------|--------|-------|
| db | [UP/DOWN] | [any issues] |
| backend | [UP/DOWN] | [any issues] |
| mobile | [UP/DOWN] | [any issues] |

**Result**: [PASS/FAIL]

---

### Phase 2: App Accessibility
- **URL**: FRONTEND_URL (see env.md)
- **Load Time**: [observed]
- **Initial Errors**: [count]

**Result**: [PASS/FAIL]

---

### Phase 3: Authentication
- **Login**: [SUCCESS/FAILED/SKIPPED]
- **Redirect**: [correct page or issue]

**Result**: [PASS/FAIL/SKIPPED]

---

### Phase 4: Feature Testing
**Feature**: [name]
**Page**: [URL]

| Check | Status | Notes |
|-------|--------|-------|
| Elements Present | [PASS/FAIL] | [details] |
| Visual Design | [PASS/FAIL] | [details] |
| Interactions | [PASS/FAIL] | [details] |
| Data Display | [PASS/FAIL] | [details] |

**Result**: [PASS/FAIL]

---

### Phase 5: Console Analysis
| Level | Count | Details |
|-------|-------|---------|
| Errors | [n] | [list if any] |
| Warnings | [n] | [list if any] |

**Result**: [PASS/WARN/FAIL]

---

### Phase 6: Responsiveness
| Device | Size | Status | Issues |
|--------|------|--------|--------|
| Mobile | 375x667 | [PASS/FAIL] | [details] |
| Tablet | 768x1024 | [PASS/FAIL] | [details] |
| Desktop | 1920x1080 | [PASS/FAIL] | [details] |

**Result**: [PASS/FAIL]

---

### Phase 7: Container Verification
| Check | Status | Details |
|-------|--------|---------|
| Code Sync | [PASS/FAIL] | [grep results] |
| Backend Logs | [PASS/WARN] | [errors found] |
| Mobile Logs | [PASS/WARN] | [errors found] |
| DB Connection | [PASS/FAIL] | [status] |
| API Health | [PASS/FAIL] | [response] |

**Result**: [PASS/FAIL]

---

### Artifacts Saved
- `ARTIFACTS_PATH/feature-[name]-desktop.png`
- `ARTIFACTS_PATH/responsive-mobile.png`
- `ARTIFACTS_PATH/responsive-tablet.png`
- `ARTIFACTS_PATH/responsive-desktop.png`

---

### Summary

| Phase | Result |
|-------|--------|
| Environment | [status] |
| Accessibility | [status] |
| Authentication | [status] |
| Feature Testing | [status] |
| Console | [status] |
| Responsiveness | [status] |
| Containers | [status] |

**Overall**: [PASS/FAIL]

### Issues Found
1. [Issue description with severity]
2. [Issue description with severity]

### Recommendations
1. [Actionable recommendation]
2. [Actionable recommendation]
```

## Usage Examples

### Example 1: Test New Login Design

```
Test the updated login screen design using app-test skill.
Focus on the new gradient background and button styling.
```

### Example 2: Test Workout Feature

```
Use app-test to verify the StartWorkout screen works correctly.
Check that exercise selection and timer functions work.
```

### Example 3: Pre-Deployment Check

```
Run app-test on all main screens before deployment.
Verify no console errors and all containers are in sync.
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container not running | Run `docker-compose up -d` |
| Login fails | Verify credentials in env.md, check backend logs |
| Screenshots not saving | Ensure `ARTIFACTS_PATH` directory exists |
| Playwright timeout | Increase timeout, check app load time |
| Console flooded | Filter by error level first |
| Wrong URLs | Check env.md has correct FRONTEND_URL/BACKEND_URL values |
