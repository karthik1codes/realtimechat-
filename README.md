# Real-Time Chat Application

A modern, real-time multi-client chat application built with React, TypeScript, and Supabase.

## Features

- 🚀 **Real-time messaging** - Instant message delivery using Supabase Realtime
- 👥 **Multiple chat rooms** - Create or join different chat rooms
- 👤 **Active user tracking** - See who's online in real-time
- 💬 **User presence** - Know when users join or leave
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 🔒 **Secure** - Built on Supabase with Row Level Security

## Prerequisites

- **Node.js** 16+ and npm
- **Supabase account** (free tier works)
- **Modern browser** (Chrome, Edge, Firefox, Safari)

## Quick Start

### 1. Clone and Install

```bash
cd E:\realtimechat\project
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `project` folder:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** To see the same messages and chat rooms as others, everyone must use the **same Supabase project credentials**. See [SHARED_DATABASE_SETUP.md](./SHARED_DATABASE_SETUP.md) for details.

**Get your Supabase credentials:**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project (or use an existing shared project)
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon public** key

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

### 3. Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and run the SQL from `supabase/migrations/20251022052118_create_chat_schema.sql`

### 4. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Usage

1. **Enter Username** - Enter your username on the login screen
2. **Select or Create Room** - Choose an existing room or create a new one
3. **Start Chatting** - Send messages and see them in real-time!

## Project Structure

```
project/
├── src/
│   ├── components/      # React components
│   │   ├── LoginScreen.tsx
│   │   ├── RoomSelection.tsx
│   │   └── ChatInterface.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useChatRoom.ts
│   ├── lib/            # Utilities and configurations
│   │   └── supabase.ts
│   └── App.tsx         # Main application component
├── supabase/
│   └── migrations/     # Database migrations
├── .env                # Environment variables (create this)
├── .env.example        # Environment template
└── package.json
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Type check TypeScript

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Supabase** - Backend (PostgreSQL + Realtime)
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Troubleshooting

### "Supabase not configured" Warning

- Check that `.env` file exists in the `project` folder
- Verify environment variables are set correctly
- Restart the dev server after creating/updating `.env`

### Connection Errors

- Verify Supabase project is active
- Check that database migration has been run
- Check browser console (F12) for detailed errors

### Messages Not Appearing

- Check Supabase Realtime is enabled in your project
- Verify Row Level Security policies are set correctly
- Check browser console for errors

## Documentation

- [Environment Setup Guide](./ENV_SETUP.md) - Detailed env variable setup
- [Shared Database Setup](./SHARED_DATABASE_SETUP.md) - **How to share messages/rooms with all users**

## License

MIT






