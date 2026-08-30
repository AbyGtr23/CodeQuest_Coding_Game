# Authentication

CodeQuest uses Supabase Auth for managing user sessions and identity.

## Authentication Flow
1. **Signup/Login**: Handled via Supabase Auth (Email/Password) on the client side.
2. **Database Trigger (`handle_new_user`)**: When a new user signs up, a PostgreSQL trigger automatically creates a corresponding row in the `public.users` table.
3. **Migration 006**: Introduced safe `ON CONFLICT` statements in the trigger function to prevent errors when dealing with auth-managed vs. app-managed fields.
4. **Client-Side AuthProvider**: The React context AuthProvider includes retry logic for profile fetching to gracefully handle the race condition where the auth session is established but the database trigger hasn't finished creating the `public.users` row.

## Security
- **Row Level Security (RLS)**: Enabled on all tables. Policies ensure users can only modify their own data and view permitted public data.
- **Protected Routes**: Next.js middleware is used to protect specific pages and API routes, ensuring they can only be accessed by authenticated sessions.
- **Admin Client**: A Supabase Service Role Key is used exclusively in secure server environments (like `/api/submit`) to bypass RLS and read hidden test cases.
