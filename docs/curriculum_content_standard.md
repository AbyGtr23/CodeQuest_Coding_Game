# Curriculum Content Standard

> This document defines the mandatory structure and quality standard for all CodeQuest curriculum contributions.

---

## Overview

CodeQuest curriculum is stored as structured JSON files in `data/seed/curriculum/`. Each file defines stages for a single tool (e.g., `python.json`, `javascript.json`). The curriculum follows a strict pedagogical hierarchy:

```
Tool
  → Level (Cadet → Soldier → Knight → Wizard → Archmage)
    → Topic (a thematic group of related concepts)
      → Concept (a specific, teachable skill)
        → Stage (a single learning unit with lesson + problem)
```

---

## Single Source of Truth Architecture

CodeQuest implements a **Single Source of Truth** for all curriculum data:

- **Quest Mode** (`/quest/[toolSlug]/[level]/[stage]`) and **Curriculum Reference Mode** (`/curriculum/[toolSlug]/[level]/[stage]`) consume the **exact same underlying database records** from the `stages` and `test_cases` tables.
- No duplicated stage files or separate static files exist.
- When an author modifies or adds a stage in `data/seed/curriculum/<tool>.json` and runs `npm run seed:curriculum`, both modes instantly update synchronously.

---

## Mandatory Structure

### Hierarchy

Every tool curriculum must be organized so that:

1. **Levels** follow the canonical progression: Cadet → Soldier → Knight → Wizard → Archmage
2. **Topics** group related concepts within a level (e.g., "Control Flow", "Data Structures")
3. **Concepts** are specific skills taught by a single stage (e.g., "if/else statements", "for loops")
4. **Stages** are individual learning units that teach one concept and assess it

### Prerequisite Ordering

- A concept MUST NOT appear before its prerequisites
- Stage N in a level SHOULD build upon concepts from Stages 1..N-1
- Higher levels MUST assume mastery of all lower-level concepts
- Cross-topic dependencies MUST be documented in the stage's `prerequisites` field

### Level Expectations

| Level | Difficulty | Target Audience | Concept Complexity |
|---|---|---|---|
| **Cadet** | Beginner | Absolute newcomers | Syntax, basic constructs, simple I/O |
| **Soldier** | Intermediate | Familiar with basics | Data structures, algorithms, patterns |
| **Knight** | Advanced | Competent practitioners | Design patterns, error handling, testing |
| **Wizard** | Expert | Experienced developers | Performance, concurrency, architecture |
| **Archmage** | Master | Domain experts | Advanced optimization, system design |

---

## Stage JSON Schema

Every stage in a curriculum JSON file must contain these fields:

```json
{
  "levelSlug": "cadet",
  "stageNumber": 1,
  "title": "Variables and Types",
  "questName": "The Variable Vault",
  "topic": "Fundamentals",
  "concept": "Variable declaration and assignment",
  "prerequisites": [],
  "learningObjectives": [
    "Declare variables using let, const, and var",
    "Understand JavaScript's dynamic typing"
  ],
  "lessonContentMd": "## Variables in JavaScript\n\nA variable is a named container...",
  "problemStatementMd": "## The Variable Vault\n\nGiven an integer `n` as input...",
  "constraints": "1 ≤ n ≤ 1000",
  "inputFormat": "A single integer n on one line",
  "outputFormat": "The result on one line",
  "examples": [
    { "input": "5", "output": "25", "explanation": "5 squared = 25" }
  ],
  "starterCode": "// Read input from stdin\nconst n = parseInt(readline());\n",
  "solutionCode": "const n = parseInt(readline());\nconsole.log(n * n);",
  "exerciseType": "coding-challenge",
  "languageId": "63",
  "difficulty": "easy",
  "xpReward": 30,
  "testCases": [
    {
      "testNumber": 1,
      "input": "5",
      "expectedOutput": "25",
      "isHidden": false,
      "timeLimitMs": 5000,
      "memoryLimitKb": 128000
    },
    {
      "testNumber": 2,
      "input": "0",
      "expectedOutput": "0",
      "isHidden": false,
      "timeLimitMs": 5000,
      "memoryLimitKb": 128000
    },
    {
      "testNumber": 3,
      "input": "1000",
      "expectedOutput": "1000000",
      "isHidden": true,
      "timeLimitMs": 5000,
      "memoryLimitKb": 128000
    }
  ]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|---|---|---|---|
| `levelSlug` | string | ✅ | One of: `cadet`, `soldier`, `knight`, `wizard`, `archmage` |
| `stageNumber` | integer | ✅ | Sequential number within the tool (1-based, globally unique per tool) |
| `title` | string | ✅ | Human-readable concept title (e.g., "Variables and Types") |
| `questName` | string | ✅ | Gamified quest title (e.g., "The Variable Vault") |
| `topic` | string | ✅ | Topic group (e.g., "Fundamentals", "Control Flow") |
| `concept` | string | ✅ | Specific concept being taught |
| `prerequisites` | string[] | ✅ | Array of concept names that must be learned first. Empty array for stage 1. |
| `learningObjectives` | string[] | ✅ | What the learner will be able to do after completing this stage |
| `lessonContentMd` | string | ✅ | Full Markdown lesson with code examples, explanations, and diagrams |
| `problemStatementMd` | string | ✅ | Full Markdown problem statement with constraints, I/O format, examples |
| `constraints` | string | Recommended | Input constraints (e.g., "1 ≤ n ≤ 1000") |
| `inputFormat` | string | Recommended | Description of stdin format |
| `outputFormat` | string | Recommended | Description of expected stdout format |
| `examples` | object[] | Recommended | Worked examples with input, output, and explanation |
| `starterCode` | string | ✅ | Starting code template. MUST differ from solution. |
| `solutionCode` | string | ✅ | Reference solution that passes all test cases |
| `exerciseType` | string | ✅ | One of: `quiz`, `fill-code`, `coding-challenge`, `debug`, `project`, `refactor` |
| `languageId` | string | ✅ | Judge0 language ID (e.g., "71" for Python, "63" for JavaScript) |
| `difficulty` | string | Recommended | One of: `easy`, `medium`, `hard` |
| `xpReward` | integer | ✅ | XP points awarded for completion |
| `testCases` | object[] | ✅ | Array of test cases (minimum 2, at least 1 hidden) |

---

## Content Quality Rules

### ❌ Never

1. **Placeholder text**: "This lesson introduces important concepts for this stage"
2. **Generic problems**: "Solve the problem for stage N. Output the expected result."
3. **Identical problems**: Two stages must never have the same problem statement
4. **Filler content**: Repeating the same sentence 20 times to pad length
5. **Wrong language**: Python starter code in a JavaScript tool curriculum
6. **Trivial test cases**: Input "1" → Output "1" for every stage
7. **Missing hidden tests**: All test cases visible (enables cheating)
8. **Solution as starter**: Starter code identical to solution code

### ✅ Always

1. **Teach one concept per stage**: Each stage focuses on a single, specific skill
2. **Build progressively**: Each stage builds on previous stages' concepts
3. **Real code examples**: Lesson includes runnable, realistic code snippets
4. **Clear problem statement**: Unambiguous description of what to compute
5. **Edge case coverage**: Test cases include boundary conditions (0, max, empty, etc.)
6. **Hidden test protection**: At least 1 hidden test case per stage
7. **Meaningful titles**: Stage titles reflect the concept being taught
8. **Proper difficulty curve**: Cadet stages are genuinely easy; Archmage stages are genuinely hard

---

## Lesson Content Guidelines

A good lesson should contain:

1. **Introduction** (1-2 sentences): What this concept is and why it matters
2. **Explanation** (2-4 paragraphs): How the concept works with clear examples
3. **Code examples** (1-3 blocks): Runnable code demonstrating the concept
4. **Key points** (bullet list): Summary of critical takeaways
5. **Common mistakes** (optional): Pitfalls beginners should avoid

### Markdown Formatting

- Use `##` for section headings
- Use triple-backtick code fences with language identifier
- Use `**bold**` for key terms on first introduction
- Use bullet lists for enumerated points
- Keep paragraphs concise (3-5 sentences max)

---

## Problem Statement Guidelines

A good problem statement should contain:

1. **Context** (1-2 sentences): A brief narrative or scenario
2. **Task** (1-2 sentences): What the program must do
3. **Input format**: Exact description of stdin format
4. **Output format**: Exact description of expected stdout format
5. **Constraints**: Range and bounds for all inputs
6. **Examples**: At least 1 worked example with explanation

---

## Test Case Guidelines

| Requirement | Details |
|---|---|
| **Minimum count** | 2 visible + 1 hidden = 3 total minimum |
| **Recommended count** | 2-3 visible + 2-3 hidden = 4-6 total |
| **Edge cases** | Must include: zero, one, maximum, empty (where applicable) |
| **Time limits** | Default: 5000ms. Reduce for performance-focused stages. |
| **Memory limits** | Default: 128000 KB. Reduce for memory-focused stages. |
| **Hidden tests** | Must test edge cases not visible in examples |

---

## Validation

Run the curriculum validator before submitting any curriculum changes:

```bash
node scripts/validate_curriculum.js
```

The validator checks:
- All required fields present
- No placeholder/filler text
- No duplicate stage numbers
- No duplicate problem statements
- Correct level ordering
- Test case integrity
- Valid exercise types and language IDs
- Content length sanity checks

**All errors must be fixed before curriculum is merged.**

---

## Contributing New Tools

To add a new tool to CodeQuest:

1. Create `data/seed/curriculum/<tool-slug>.json`
2. Add the tool to `data/seed/tools.json` with the correct `total_stages` count
3. Follow this content standard for every stage
4. Run `node scripts/validate_curriculum.js` — must pass with zero errors
5. Run `npm run seed:curriculum` to test seeding
6. Verify the tool appears in `/curriculum` and `/catalog`

---

## Language ID Reference

| Language | Judge0 ID |
|---|---|
| Python 3 | 71 |
| JavaScript (Node.js) | 63 |
| TypeScript | 74 |
| Go | 60 |
| Rust | 73 |
| C++ | 54 |
| Bash | 46 |
| SQL | 82 |
