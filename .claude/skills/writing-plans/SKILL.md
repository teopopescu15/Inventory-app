---
name: writing-plans
description: Use when design is complete and you need detailed implementation tasks for engineers with zero codebase context - creates comprehensive implementation plans with exact file paths, complete code examples, and verification steps assuming engineer has minimal domain knowledge
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** This should be run in a dedicated worktree (created by brainstorming skill).

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**E2E Test Plan:**
- **Screens to verify:** [List each screen/component that will be visually affected]
- **User flows to test:** [Step-by-step user actions, e.g., "User taps Add → fills form → taps Save → sees confirmation"]
- **Success indicators:** [What proves it works: "Toast appears", "Item shows in list", "Navigation completes"]
- **Potential failure points:** [Where things might break: "Network timeout", "Empty state not handled", "Animation glitch"]

---
```

## Task Structure

```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
```

## Test Quality Guidelines

### What Unit Tests Should Cover

For each function/component, test:
1. **Happy path** - Normal expected input → expected output
2. **Edge cases** - Empty input, null, undefined, boundary values
3. **Error cases** - Invalid input → proper error handling
4. **State changes** - Before/after for mutations

### Test Naming Convention

```
test_[what]_[condition]_[expected result]
```

Examples:
- `test_saveWorkout_withValidData_returnsSuccess`
- `test_saveWorkout_withEmptyName_throwsValidationError`
- `test_deleteWorkout_whenNotFound_returns404`

### What Makes a Good Test

| Good Test | Bad Test |
|-----------|----------|
| Tests ONE behavior | Tests multiple things |
| Descriptive name explains what it tests | Vague name like `test_workout` |
| Fails clearly when broken | Fails with cryptic message |
| Independent (no order dependency) | Depends on other tests running first |
| Uses real code paths | Mocks everything including the thing being tested |

### What NOT to Test

- Framework/library internals (React, Expo already tested)
- Trivial getters/setters with no logic
- Third-party API implementations
- Pure configuration files

### Test Structure (Arrange-Act-Assert)

```typescript
it('should save workout when data is valid', () => {
  // Arrange - set up test data
  const workout = { name: 'Leg Day', exercises: [...] };

  // Act - perform the action
  const result = saveWorkout(workout);

  // Assert - verify the outcome
  expect(result.success).toBe(true);
  expect(result.id).toBeDefined();
});
```

## Remember

**Planning:**
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- Reference relevant skills with @ syntax

**Testing:**
- Every feature task includes unit test steps (TDD)
- Final task is ALWAYS visual verification with app-test
- Include E2E test plan in header

**Principles:**
- DRY, YAGNI, TDD, frequent commits

## Final Verification Task (MANDATORY)

**Every implementation plan MUST end with this task.** Do not skip.

```markdown
### Task [FINAL]: Visual Verification

> **REQUIRED SKILL:** Use `app-test` skill for this task

**Prerequisites:**
- All previous tasks completed
- All unit tests passing
- Code committed

**Step 1: Start the app**

```bash
npx expo start
```

Verify: App launches without crash, no red error screen

**Step 2: Run app-test skill**

Use the `app-test` skill to verify:

**Visual Checks:**
- [ ] [Screen Name] renders correctly
- [ ] [Component] displays expected data
- [ ] [UI Element] responds to interaction
- [ ] No layout broken on mobile (375px)
- [ ] No layout broken on tablet (768px)
- [ ] No layout broken on desktop (1280px)

**Functional Checks:**
- [ ] [User Flow 1]: [Action] → [Expected Result]
- [ ] [User Flow 2]: [Action] → [Expected Result]
- [ ] [Edge Case]: [Condition] → [Expected Behavior]

**Console Checks:**
- [ ] No JavaScript errors in console
- [ ] No warning spam (occasional warnings OK)
- [ ] No failed network requests (check Network tab)

**Step 3: Document results**

If all checks pass: Proceed to execution handoff
If any check fails: Document issue, return to relevant task to fix
```

### Debugging Playwright/app-test Failures

**Common errors and solutions:**

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `Element not found` | Selector changed, element not rendered | Check if component mounted, verify selector matches current DOM |
| `Timeout waiting for element` | Slow render, async data not loaded | Add explicit wait for data, check if API call completing |
| `Element not visible` | Hidden by CSS, scroll position, z-index | Check element visibility, scroll into view first |
| `Navigation timeout` | App crashed, infinite loop, dead route | Check console for errors, verify route exists |
| `Screenshot mismatch` | Intentional UI change, or regression | If intentional: update baseline. If not: fix regression |
| `Network request failed` | Backend down, wrong URL, CORS | Verify backend running, check URL, check CORS config |

**Debugging steps:**
1. Take screenshot at failure point (`mcp__playwright__browser_take_screenshot`)
2. Check console messages (`mcp__playwright__browser_console_messages`)
3. Check network requests (`mcp__playwright__browser_network_requests`)
4. Get page snapshot (`mcp__playwright__browser_snapshot`)
5. If still stuck: manually reproduce in browser to isolate issue

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/plans/<filename>.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?"**

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use subagent-driven-development
- Stay in this session
- Fresh subagent per task + code review

**If Parallel Session chosen:**
- Guide them to open new session in worktree
- **REQUIRED SUB-SKILL:** New session uses executing-plans

---

## Project-Specific Rules

> **IMPORTANT**: Plans must account for project rules:
> - See `../project-rules/expo-guidance.md` for Expo SDK requirements
> - See `../project-rules/code-integrity.md` for zero duplication policy

Include rule reminders in plan tasks where relevant.
