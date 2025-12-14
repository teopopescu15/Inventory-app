---
name: idea-refiner
description: Use when user provides a raw idea/prompt to transform it into a well-structured, actionable request using prompt engineering principles. Applies refinement, adds examples, validates understanding, and explores codebase context before proceeding to implementation.
---

# Idea Refiner Skill

Transform raw, unstructured ideas into clear, actionable prompts using prompt engineering best practices.

## When to Use This Skill

Use this skill when:
- User provides a rough/raw idea for a feature, optimization, design change, or bug fix
- The request is vague or could be interpreted multiple ways
- You want to ensure mutual understanding before starting work
- The idea needs validation against the existing codebase

## The Iron Law

**NEVER START IMPLEMENTATION WITHOUT USER CONFIRMATION OF THE REFINED IDEA.**

The goal is clarity and alignment, not speed. A well-refined idea saves hours of rework.

---

## Phase 1: Capture the Raw Idea

When user provides their raw idea, acknowledge it exactly as stated:

```
## Raw Idea Captured
"{user's exact words}"
```

Identify the **intent category**:
- [ ] New Feature
- [ ] Bug Fix
- [ ] Design/UI Improvement
- [ ] Performance Optimization
- [ ] Refactoring
- [ ] Other: ___

---

## Phase 2: Apply Prompt Engineering Principles

Transform the raw idea using these core principles from Claude 4.x best practices:

### 2.1 Be Explicit with Instructions

| Raw (Vague) | Refined (Explicit) |
|-------------|-------------------|
| "make it faster" | "Reduce the load time of the workout list screen from 3s to under 1s by implementing pagination and lazy loading" |
| "fix the bug" | "Fix the crash that occurs when user taps 'Save' on an empty workout form by adding input validation" |
| "improve the design" | "Redesign the home screen header to use a gradient background, larger typography for the greeting, and add the user's streak count" |

### 2.2 Add Context and Motivation

Explain **WHY** this matters:
- What problem does this solve?
- Who benefits from this change?
- What happens if we don't do this?

### 2.3 Provide Concrete Examples

Create 2-3 examples that illustrate the expected behavior:

```
Example 1: [Scenario] → [Expected Outcome]
Example 2: [Scenario] → [Expected Outcome]
Example 3: [Edge case] → [Expected Outcome]
```

### 2.4 Define Success Criteria

What does "done" look like?
- [ ] Measurable outcome 1
- [ ] Measurable outcome 2
- [ ] Measurable outcome 3

### 2.5 Specify Constraints (if any)

- Technical constraints (must use existing X)
- Design constraints (must match Y style)
- Time/scope constraints (MVP first, enhancements later)

---

## Phase 3: Present the Refined Idea

Output the refined idea in this structured format:

```markdown
## Refined Idea

### Summary
[One clear sentence describing what we're building/fixing/improving]

### Context & Motivation
[Why this matters - the problem being solved]

### Detailed Description
[Explicit, detailed description of the change]

### Examples

**Example 1:** [Scenario]
- Input/Action: [what user does]
- Expected Result: [what should happen]

**Example 2:** [Scenario]
- Input/Action: [what user does]
- Expected Result: [what should happen]

**Example 3 (Edge Case):** [Scenario]
- Input/Action: [what user does]
- Expected Result: [what should happen]

### Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Out of Scope (for this iteration)
- [Things we're NOT doing right now]
```

---

## Phase 4: User Confirmation

**ASK THE USER:**

```
Does this refined idea accurately capture what you want?

Options:
1. Yes, this is exactly what I meant - proceed to codebase exploration
2. Partially - I want to adjust [specific part]
3. No - let me clarify my idea
4. I want to brainstorm alternative approaches first
```

**DO NOT PROCEED** until user confirms with option 1 or explicitly approves adjustments.

---

## Phase 5: Codebase Exploration

After user confirms, use the "@agent-Explore" to validate the idea against the codebase:

```
I'm using the "@agent-Explore" to validate this idea against your codebase.

Investigating:
1. Where would this change be implemented?
2. What existing code/components are affected?
3. Are there similar patterns we should follow?
4. Any potential conflicts or dependencies?
5. Does this idea align with the current architecture?
```

### Explore Agent Prompt Template

```
Explore the codebase to validate this feature/change idea:

**Idea Summary:** [refined summary]

Investigate:
1. Identify files/components that would need modification
2. Find similar existing implementations to follow as patterns
3. Check for potential conflicts with existing functionality
4. Verify the idea aligns with current architecture
5. Note any technical considerations or blockers

Return:
- List of affected files with brief descriptions
- Relevant patterns/conventions from existing code
- Potential concerns or blockers
- Recommendation: feasible / needs adjustment / significant concerns
```

---

## Phase 6: Exploration Report & Next Step Selection

Present findings and **ask user to choose the next step**:

```markdown
## Codebase Exploration Report

### Affected Areas
- `path/to/file1.tsx` - [what changes needed]
- `path/to/file2.ts` - [what changes needed]

### Existing Patterns to Follow
- [Pattern 1 from codebase]
- [Pattern 2 from codebase]

### Feasibility Assessment
[Feasible / Needs adjustment / Has concerns]

### Considerations
- [Technical consideration 1]
- [Technical consideration 2]

---

## What would you like to do next?

1. **Brainstorm** - Explore alternative approaches and design trade-offs
2. **Create Plan** - Go directly to writing an implementation plan
3. **Refine Idea** - Adjust the idea based on exploration findings
4. **Ask Questions** - Clarify something about the exploration
5. **Start Simple** - Skip planning, implement directly with TDD (for very small tasks)
```

### Decision Guidance

Provide a recommendation but **always let the user decide**:

```markdown
### My Recommendation

Based on the exploration:
- [Straightforward / Multiple approaches possible / Complex]
- [Recommended: brainstorming / writing-plans / TDD]

**Reason:** [Brief explanation why this recommendation]

But this is your call - what would you like to do?
```

### After User Chooses

| User Choice | Action |
|-------------|--------|
| "Brainstorm" / "1" | Announce and invoke `brainstorming` skill |
| "Create Plan" / "2" | Announce and invoke `writing-plans` skill |
| "Refine" / "3" | Loop back to Phase 2 with new input |
| "Questions" / "4" | Answer questions, then re-present options |
| "Start Simple" / "5" | Announce and invoke `test-driven-development` skill |

---

## Refinement Examples

### Example 1: Feature Request

**Raw Input:**
> "add dark mode"

**Refined Output:**

```markdown
## Refined Idea

### Summary
Implement a dark mode theme that users can toggle, with automatic system preference detection.

### Context & Motivation
Users often use fitness apps in low-light environments (early morning, evening workouts).
Dark mode reduces eye strain and battery consumption on OLED screens.

### Detailed Description
Add a theme toggle in Settings that switches between light and dark color schemes.
The app should respect the device's system preference by default but allow manual override.
All screens, components, and modals should support both themes.

### Examples

**Example 1:** First Launch
- Input/Action: User opens app for first time, phone is set to dark mode
- Expected Result: App automatically displays in dark theme

**Example 2:** Manual Toggle
- Input/Action: User goes to Settings > Appearance > toggles "Dark Mode" ON
- Expected Result: App immediately switches to dark theme, preference is saved

**Example 3 (Edge Case):** System Change While App Open
- Input/Action: User changes phone from light to dark mode while app is running
- Expected Result: If "Follow System" is enabled, app updates; if manual override set, no change

### Success Criteria
- [ ] All screens render correctly in both themes
- [ ] Theme preference persists across app restarts
- [ ] System preference detection works on iOS and Android
- [ ] No flash of wrong theme on app launch
- [ ] Toggle animation is smooth (< 200ms)

### Out of Scope (for this iteration)
- Scheduled dark mode (auto-switch at sunset)
- Custom color themes beyond light/dark
- Per-screen theme overrides
```

---

### Example 2: Bug Fix

**Raw Input:**
> "the save button doesn't work sometimes"

**Refined Output:**

```markdown
## Refined Idea

### Summary
Fix intermittent save button failure on the workout creation screen.

### Context & Motivation
Users are losing workout data when the save fails silently. This causes frustration
and erodes trust in the app's reliability.

### Detailed Description
Investigate and fix the root cause of save button failures. Add proper error handling
and user feedback so users always know the state of their save operation.

### Examples

**Example 1:** Successful Save
- Input/Action: User fills workout form completely, taps Save
- Expected Result: Loading indicator shows, success toast appears, navigates to workout list

**Example 2:** Network Error
- Input/Action: User taps Save while offline
- Expected Result: Error toast "Unable to save - check your connection", data preserved in form

**Example 3 (Edge Case):** Rapid Double-Tap
- Input/Action: User accidentally double-taps Save button quickly
- Expected Result: Button disables after first tap, only one save request sent

### Success Criteria
- [ ] Save succeeds 100% of the time when network available
- [ ] Clear error message shown on failure
- [ ] Form data never lost on failed save
- [ ] No duplicate saves from double-taps
- [ ] Loading state visible during save operation

### Out of Scope (for this iteration)
- Offline-first architecture with sync
- Auto-save drafts
```

---

### Example 3: Design Improvement

**Raw Input:**
> "home screen looks boring"

**Refined Output:**

```markdown
## Refined Idea

### Summary
Redesign the home screen to be more engaging with personalized content, visual hierarchy, and motivational elements.

### Context & Motivation
The current home screen is functional but doesn't inspire users to work out. A more
engaging design can improve daily active usage and workout completion rates.

### Detailed Description
Transform the home screen from a simple list view to a dynamic dashboard featuring:
- Personalized greeting with user's name and current streak
- Today's recommended workout with eye-catching card design
- Progress visualization (weekly activity chart)
- Quick-action buttons for common tasks
- Motivational quote or achievement celebration

### Examples

**Example 1:** Morning Visit (has workout scheduled)
- Input/Action: User opens app at 7 AM with a scheduled workout
- Expected Result: "Good morning, Alex! Ready for Leg Day?" with prominent workout card

**Example 2:** Streak Milestone
- Input/Action: User opens app on their 7th consecutive day
- Expected Result: Celebration animation, "1 Week Streak!" badge prominently displayed

**Example 3 (Edge Case):** New User (no history)
- Input/Action: Brand new user opens home screen
- Expected Result: Welcoming onboarding prompt, suggested starter workouts, no empty states

### Success Criteria
- [ ] Home screen loads in < 500ms
- [ ] Personalized content visible above fold
- [ ] Clear visual hierarchy guides user to primary action
- [ ] Design matches app's brand guidelines
- [ ] Works on all screen sizes (phone, tablet)

### Out of Scope (for this iteration)
- Social features (friends' activity)
- AI-powered workout recommendations
- Gamification system beyond streaks
```

---

## Common Rationalizations That Mean You're Skipping This Skill

| Rationalization | Why It's Wrong |
|-----------------|----------------|
| "I understand what they mean" | Assumptions cause rework. Confirm explicitly. |
| "It's a simple change" | Simple requests often hide complexity. Explore first. |
| "I'll figure it out as I go" | Leads to scope creep and misaligned expectations. |
| "They're in a hurry" | 5 minutes of refinement saves hours of wrong implementation. |
| "The codebase exploration will slow us down" | Discovering blockers early is faster than discovering them mid-implementation. |

---

## Red Flags

You're misusing this skill if:
- You skip straight to Phase 5 without user confirmation
- You don't provide concrete examples
- You accept "yes" without presenting the refined idea
- You start implementation before codebase exploration
- You skip refinement for "obvious" requests

---

## Integration with Superpowers Framework

This skill is the **entry point** of the superpowers workflow:

```
┌────────────────────────────────────────────────────────────────┐
│                    SUPERPOWERS WORKFLOW                        │
│                                                                │
│  ┌──────────────┐                                              │
│  │ idea-refiner │ ← YOU ARE HERE (Entry Point)                 │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ↓                                                      │
│  ┌──────────────┐                                              │
│  │ User Confirms│                                              │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ↓                                                      │
│  ┌──────────────┐                                              │
│  │@agent-Explore│                                              │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ↓                                                      │
│  ┌──────────────────────────────────────┐                      │
│  │ USER CHOOSES NEXT STEP               │                      │
│  │                                      │                      │
│  │  1. Brainstorm    → brainstorming    │                      │
│  │  2. Create Plan   → writing-plans    │                      │
│  │  3. Refine        → back to Phase 2  │                      │
│  │  4. Questions     → answer & re-ask  │                      │
│  │  5. Start Simple  → TDD directly     │                      │
│  └──────────────────────────────────────┘                      │
│         │                                                      │
│         ↓                                                      │
│  [Selected skill activates]                                    │
│         │                                                      │
│         ↓                                                      │
│  ┌────────────────┐                                            │
│  │    app-test    │ (MANDATORY at end)                         │
│  └────────────────┘                                            │
└────────────────────────────────────────────────────────────────┘
```

### User-Driven Skill Selection

**The user always decides what happens next.** I provide a recommendation but wait for explicit choice.

| User Says | Skill Invoked |
|-----------|---------------|
| "Brainstorm" / "1" | `brainstorming` |
| "Create Plan" / "2" | `writing-plans` |
| "Refine" / "3" | Loop back to Phase 2 |
| "Questions" / "4" | Answer, then re-present options |
| "Start Simple" / "5" | `test-driven-development` |

### After User Chooses

1. **Announce** which skill is being activated
2. **Use the Skill tool** to load the chosen skill
3. **Pass context** from idea-refiner to the next skill:
   - Refined idea summary
   - Success criteria
   - Affected files from exploration
   - Constraints identified

---

## Quick Reference: Prompt Engineering Principles Applied

| Principle | Application in This Skill |
|-----------|--------------------------|
| Be explicit | Transform vague → specific language |
| Add context | Include WHY and WHO benefits |
| Use examples | 2-3 concrete scenarios with expected outcomes |
| Define success | Measurable criteria checklist |
| Match style | Output format matches implementation needs |
| Verify understanding | Mandatory user confirmation checkpoint |
| Investigate before acting | Codebase exploration before planning |
