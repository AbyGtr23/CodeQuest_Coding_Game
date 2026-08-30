# Curriculum System

## Hierarchy
CodeQuest organizes learning content into a structured hierarchy:
**Tool** (e.g., Python) → **Level** (e.g., Basics) → **Topic** → **Concept** → **Stage** (e.g., Variables Challenge)

## Data Structure
Curriculum definitions are stored as JSON files matching the hierarchy schemas located in `data/seed/curriculum/*.json`.

## Seeding & Validation
- **Seeding (`scripts/seed-curriculum.js`)**: An idempotent script that parses the JSON files and upserts the data into the Supabase database.
- **Validation (`scripts/validate_curriculum.js`)**: Validates the JSON schema structure before seeding.

## CURRENT STATUS: PLACEHOLDER CONTENT
**IMPORTANT**: As of the current project state, the curriculum content in the JSON files is largely **placeholder/filler**. 
While 12 tools are defined in the raw JSONs, only 3 (`python`, `javascript`, `git`) are actively registered in the `tools.json` index. 
A real pedagogically structured curriculum has **NOT** been written yet. The current setup serves to test the platform architecture and UI.

For future content creators, refer to `docs/curriculum_content_standard.md` (to be created) for authoring guidelines.
