# CodeQuest Curriculum System

## Hierarchy
CodeQuest organizes learning content into a strict, quality-driven pedagogical hierarchy:
```
TOOL (e.g. Python, JavaScript, Git, SQL)
  → LEVEL (Cadet → Soldier → Knight → Wizard → Archmage)
    → TOPIC (e.g. Control Flow, Functions, Data Structures)
      → CONCEPT (e.g. String Manipulation, Array Filtering)
        → STAGE (Single learning unit with Lesson + Problem + Test Cases)
```

## Data Model & Single Source of Truth
Curriculum definitions are stored in structured JSON files in `data/seed/curriculum/<tool>.json`.
- Both **Quest Mode** (`/quest/[toolSlug]/[level]/[stage]`) and **Curriculum Reference Subsystem** (`/curriculum/[toolSlug]/[level]/[stage]`) query the **exact same underlying database records** (`stages` and `test_cases` tables).
- There is **zero duplication** between learning modes.

## Authored Curriculum Status
- **Python** (`python.json`): 15 Cadet stages fully authored with real lessons, problems, examples, starter code, reference solutions, and test cases (visible + hidden).
- **JavaScript** (`javascript.json`): 15 Cadet stages fully authored covering JS fundamentals, loops, arrays, objects, `.filter()`, and `.map()`.
- **Git** (`git.json`): 10 Cadet stages fully authored covering `git init`, `add`, `commit`, `status`, `log`, `branch`, `checkout`, `merge`, `remote`, `push`.
- **SQL** (`sql.json`): 10 Cadet stages fully authored covering `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `COUNT`, `SUM`/`AVG`, `GROUP BY`, `INNER JOIN`.
- **Registered Tools Catalog** (`tools.json`): All 12 tools are registered with accurate stage counts and difficulty ratings. Additional tools (`typescript`, `go`, `rust`, `linux-cli`, `docker`, `nodejs`, `react`, `django`) are registered with 0 stages pending future curriculum authoring per `docs/curriculum_content_standard.md`.

## Seeding & Validation Tools
- **Seeding (`npm run seed:curriculum`)**: Idempotent script (`scripts/seed-curriculum.js`) using `upsert` on conflict keys.
- **Validation (`npm run validate:curriculum`)**: Automated script (`scripts/validate_curriculum.js`) enforcing quality standards, prerequisite integrity, no filler text, and test case completeness.
