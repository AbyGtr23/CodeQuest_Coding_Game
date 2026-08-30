# API Documentation

CodeQuest uses Next.js API Routes as server-side controllers.

## Routes

### `GET /api/tools`
- **Description**: Retrieves a list of available tools/languages.
- **Auth**: Public or Authenticated.
- **Response**: `[ { id, name, slug, description, icon, order_index } ]`

### `GET /api/quest/[toolSlug]`
- **Description**: Retrieves levels and overview for a specific tool.
- **Auth**: Authenticated.
- **Response**: `{ tool: {...}, levels: [...] }`

### `GET /api/quest/[toolSlug]/[level]/[stage]`
- **Description**: Retrieves data for a specific stage, including visible test cases.
- **Auth**: Authenticated.
- **Response**: `{ stage: {...}, visible_test_cases: [...] }`

### `POST /api/run`
- **Description**: Quick execution of user code against the *first visible* test case.
- **Auth**: Authenticated.
- **Request Body**: `{ code: string, language_id: number, stage_id: string }`
- **Response**: `{ stdout: string, stderr: string, status: string, compile_output: string }`

### `POST /api/submit`
- **Description**: Full submission evaluation. Fetches *all* test cases (including hidden) securely using an admin client, runs them via Judge0, and processes server-side progression (XP, stage completion, streak update).
- **Auth**: Authenticated.
- **Request Body**: `{ code: string, language_id: number, stage_id: string }`
- **Response**: `{ success: boolean, results: [...], xp_earned: number, new_rank: string }`

### `GET /api/user/tools`
- **Description**: Retrieves the user's progress across different tools.
- **Auth**: Authenticated.

### `POST /api/user/tools`
- **Description**: Updates or initializes progress for a tool.
- **Auth**: Authenticated.

### `GET /api/calendar`
- **Description**: Retrieves user's daily activity data for the contribution calendar.
- **Auth**: Authenticated.
- **Response**: `[ { date: string, count: number } ]`

### `GET /api/profile`
- **Description**: Retrieves the current user's profile details.
- **Auth**: Authenticated.

### `GET /api/leaderboard`
- **Description**: Retrieves global leaderboard data based on XP.
- **Auth**: Public or Authenticated.
