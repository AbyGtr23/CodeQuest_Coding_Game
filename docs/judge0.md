# Judge0 Integration

CodeQuest utilizes Judge0 as the secure code execution engine for user submissions.

## Core Functions (`lib/judge0.js`)
- `submitCode`: Sends code and standard input to Judge0 for compilation and execution.
- `runTestCases`: Orchestrates running multiple test cases (both visible and hidden) for a submission.

## Data Encoding
To ensure safe transport of complex strings, code, and test case inputs/outputs, all payloads sent to Judge0 are base64 encoded.
- We use `Buffer.from(string).toString('base64')` for Node.js safe base64 encoding.
- `base64_encoded: true` is passed in the Judge0 request payload.

## Language Mapping
Judge0 requires a specific `language_id`. The application maintains a mapping of tool slugs (e.g., `python`, `javascript`) to Judge0 IDs.

## API Integration
- **`/api/run`**: Designed for quick feedback. Executes the submitted code against only the first visible test case.
- **`/api/submit`**: Designed for final evaluation.
    - Server-side securely fetches *all* test cases from Supabase (including hidden ones, using the admin client to bypass RLS).
    - Runs the code against all fetched test cases sequentially or in batch.
    - Determines success, calculates execution time, and triggers user progression logic upon full success.
