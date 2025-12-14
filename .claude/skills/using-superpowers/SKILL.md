---
name: using-superpowers
description: Use when starting any conversation - establishes mandatory workflows for finding and using skills, including using Skill tool before announcing usage, following brainstorming before coding, and creating TodoWrite todos for checklists
---

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST read the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

# Getting Started with Skills

## MANDATORY FIRST RESPONSE PROTOCOL

Before responding to ANY user message, you MUST complete this checklist:

1. ☐ List available skills in your mind
2. ☐ Ask yourself: "Does ANY skill match this request?"
3. ☐ If yes → Use the Skill tool to read and run the skill file
4. ☐ Announce which skill you're using
5. ☐ Follow the skill exactly

**Responding WITHOUT completing this checklist = automatic failure.**

## Critical Rules

1. **Follow mandatory workflows.** Brainstorming before coding. Check for relevant skills before ANY task.

2. Execute skills with the Skill tool

## Common Rationalizations That Mean You're About To Fail

If you catch yourself thinking ANY of these thoughts, STOP. You are rationalizing. Check for and use the skill.

- "This is just a simple question" → WRONG. Questions are tasks. Check for skills.
- "I can check git/files quickly" → WRONG. Files don't have conversation context. Check for skills.
- "Let me gather information first" → WRONG. Skills tell you HOW to gather information. Check for skills.
- "This doesn't need a formal skill" → WRONG. If a skill exists for it, use it.
- "I remember this skill" → WRONG. Skills evolve. Run the current version.
- "This doesn't count as a task" → WRONG. If you're taking action, it's a task. Check for skills.
- "The skill is overkill for this" → WRONG. Skills exist because simple things become complex. Use it.
- "I'll just do this one thing first" → WRONG. Check for skills BEFORE doing anything.

**Why:** Skills document proven techniques that save time and prevent mistakes. Not using available skills means repeating solved problems and making known errors.

If a skill for your task exists, you must use it or you will fail at your task.

## Skills with Checklists

If a skill has a checklist, YOU MUST create TodoWrite todos for EACH item.

**Don't:**
- Work through checklist mentally
- Skip creating todos "to save time"
- Batch multiple items into one todo
- Mark complete without doing them

**Why:** Checklists without TodoWrite tracking = steps get skipped. Every time. The overhead of TodoWrite is tiny compared to the cost of missing steps.

## Announcing Skill Usage

Before using a skill, announce that you are using it.
"I'm using [Skill Name] to [what you're doing]."

**Examples:**
- "I'm using the brainstorming skill to refine your idea into a design."
- "I'm using the test-driven-development skill to implement this feature."

**Why:** Transparency helps your human partner understand your process and catch errors early. It also confirms you actually read the skill.

# About these skills

**Many skills contain rigid rules (TDD, debugging, verification).** Follow them exactly. Don't adapt away the discipline.

**Some skills are flexible patterns (architecture, naming).** Adapt core principles to your context.

The skill itself tells you which type it is.

## Instructions ≠ Permission to Skip Workflows

Your human partner's specific instructions describe WHAT to do, not HOW.

"Add X", "Fix Y" = the goal, NOT permission to skip brainstorming, TDD, or RED-GREEN-REFACTOR.

**Red flags:** "Instruction was specific" • "Seems simple" • "Workflow is overkill"

**Why:** Specific instructions mean clear requirements, which is when workflows matter MOST. Skipping process on "simple" tasks is how simple tasks become complex problems.

## Complete Workflows

### 🔵 ENTRY POINT: Idea Refinement (Start Here for Any New Work)

When user provides a raw idea, feature request, or change:

```
┌─────────────────────────────────────────────────────────────┐
│  USER'S RAW IDEA                                            │
│  "add dark mode" / "fix the bug" / "make it faster"         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  1. idea-refiner → Transform raw idea                       │
│     • Apply prompt engineering principles                   │
│     • Add context, examples, success criteria               │
│     • Present refined idea for confirmation                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. USER CONFIRMS                                           │
│     "Yes, that's what I meant"                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Explore agent → Validate against codebase               │
│     • Find affected files                                   │
│     • Check existing patterns                               │
│     • Assess feasibility                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
┌─────────────────────────┐   ┌─────────────────────────┐
│  COMPLEX/UNCLEAR        │   │  CLEAR/STRAIGHTFORWARD  │
│  → brainstorming        │   │  → writing-plans        │
│  (explore alternatives) │   │  (direct to planning)   │
└─────────────────────────┘   └─────────────────────────┘
              ↓                           ↓
              └─────────────┬─────────────┘
                            ↓
            [Continue to Feature/Bug/Design workflow]
```

**When to use idea-refiner:**
- User provides vague or raw request
- Multiple interpretations possible
- Want to ensure alignment before work begins
- Complex feature that needs examples to clarify

**When to skip idea-refiner:**
- User already provided explicit, detailed requirements
- Continuing work from a previous session
- Simple, unambiguous task (e.g., "run the tests")

### Feature Development Workflow
```
0. idea-refiner → refine raw idea (if needed) ← NEW ENTRY POINT
   ↓ (user confirms)
1. brainstorming → design the feature (if complex/alternatives needed)
   OR writing-plans → direct to planning (if straightforward)
2. using-git-worktrees → create isolated workspace
3. writing-plans → create implementation plan
4. executing-plans OR subagent-driven-development → implement
5. test-driven-development → write tests
6. requesting-code-review → get review
7. app-test → VERIFY IN BROWSER (MANDATORY)
8. finishing-a-development-branch → complete
```

### Bug Fix Workflow
```
0. idea-refiner → clarify bug description (if vague) ← NEW ENTRY POINT
   ↓ (user confirms)
1. systematic-debugging → investigate root cause
2. root-cause-tracing → trace to source
3. test-driven-development → write failing test, then fix
4. app-test → VERIFY FIX IN BROWSER (MANDATORY)
5. requesting-code-review → get review
```

### Design/UI Change Workflow
```
0. idea-refiner → clarify design intent (if vague) ← NEW ENTRY POINT
   ↓ (user confirms)
1. Implement changes
2. app-test → VERIFY VISUALLY IN BROWSER (MANDATORY)
   - Check responsiveness (mobile, tablet, desktop)
   - Verify console has no errors
   - Test user flows
```

## 🔴 CRITICAL: app-test is MANDATORY

**After ANY of these changes, you MUST run `app-test`:**
- New feature implemented
- Bug fixed
- UI/design changes
- Component modifications
- Screen additions
- Style changes

**DO NOT claim work is complete without running app-test first.**

The `app-test` skill:
- Tests the actual running Expo app via Playwright MCP
- Checks console for JavaScript errors
- Verifies responsiveness across device sizes
- Validates user flows work end-to-end
- Inspects network requests to backend

## Summary

**Starting any task:**
1. If relevant skill exists → Use the skill
2. Announce you're using it
3. Follow what it says
4. **After code changes → Run app-test**

**Skill has checklist?** TodoWrite for every item.

**Finding a relevant skill = mandatory to read and use it. Not optional.**
