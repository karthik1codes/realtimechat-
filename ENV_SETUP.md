# Environment Variables Setup Guide

This guide explains how to configure environment variables for the Real-Time Chat application.

## ⚠️ Important: Shared Database

**To see the same messages and chat rooms as others**, everyone must use the **same Supabase project**. See [SHARED_DATABASE_SETUP.md](./SHARED_DATABASE_SETUP.md) for details on setting up a shared database.

## Required Environment Variables

The application requires the following environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public API key

## Quick Setup

### Step 1: Create `.env` File

In the `project` folder, create a file named `.env` (not `.env.example`).

### Step 2: Add Your Supabase Credentials

Copy the following template into your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Get Your Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Create a new project or select an existing one
4. Wait for the project to finish setting up (takes 1-2 minutes)
5. Go to **Settings** → **API**
6. Copy the following values:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** key → Use as `VITE_SUPABASE_ANON_KEY`

### Step 4: Update Your `.env` File

Replace the placeholder values in your `.env` file:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Run Database Migration

After setting up your Supabase project, you need to run the database migration:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251022052118_create_chat_schema.sql`
4. Paste and run it in the SQL Editor
5. Click **Run** to execute the migration

### Step 6: Restart Your Dev Server

After creating/updating your `.env` file:

1. Stop your dev server (Ctrl+C)
2. Restart it: `npm run dev`
3. The app should now connect to your Supabase project

## File Structure

```
project/
├── .env                 # Your actual environment variables (NOT in git)
├── .env.example         # Template file (safe to commit to git)
├── src/
│   └── lib/
│       └── supabase.ts # Uses environment variables
└── ENV_SETUP.md        # This file
```

## Important Notes

⚠️ **Security Warning:**
- Never commit your `.env` file to git
- The `.env` file is already in `.gitignore`
- Only commit `.env.example` as a template

⚠️ **Vite Environment Variables:**
- All environment variables must start with `VITE_` to be accessible in the browser
- Environment variables are embedded at build time
- Changes to `.env` require restarting the dev server

## Troubleshooting

### "Supabase not configured" Warning

If you see this warning in the console:
- Check that your `.env` file exists in the `project` folder
- Verify the variable names are correct (must start with `VITE_`)
- Make sure you've restarted the dev server after creating/updating `.env`
- Check that the values are not the placeholder values

### Connection Errors

If you get connection errors:
- Verify your Supabase project is active (not paused)
- Check that the URL and key are correct (no extra spaces)
- Ensure the database migration has been run
- Check browser console (F12) for detailed error messages

### Environment Variables Not Loading

If variables aren't loading:
1. Make sure the file is named exactly `.env` (not `.env.txt` or `.env.local`)
2. Restart the dev server completely
3. Check that variables start with `VITE_`
4. Verify the file is in the `project` folder (same level as `package.json`)

## Example `.env` File

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

## Need Help?

- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Dashboard: [https://app.supabase.com](https://app.supabase.com)
- Check browser console (F12) for detailed error messages






