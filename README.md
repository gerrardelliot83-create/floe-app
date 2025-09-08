# Floe - Deep Work & Productivity App

A minimalist productivity application designed for deep work and task management with a clean, distraction-free interface.

## Features

- **Task Management**: Organize tasks into projects with rich text editing capabilities
- **Deep Work Mode**: Pomodoro timer with customizable focus and break periods
- **EditorJS Integration**: Rich text editing with support for headings, checklists, images, and file attachments
- **Glassmorphic UI**: Beautiful, modern interface with glassmorphism effects
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Magic Link Authentication**: Secure, passwordless authentication via Supabase

## Tech Stack

- **Frontend**: React, Next.js 14, TypeScript
- **Styling**: Vanilla CSS with glassmorphic design
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Magic Link
- **File Storage**: UploadThing
- **Rich Text Editor**: EditorJS
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd floe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema in `supabase-schema.sql` in your Supabase SQL editor
3. Get your project URL and anon key from Project Settings > API

### 4. Set up UploadThing

1. Create an account at [uploadthing.com](https://uploadthing.com)
2. Create a new app and get your API keys

### 5. Configure environment variables

Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
UPLOADTHING_TOKEN=your_uploadthing_token
UPLOADTHING_SECRET=your_uploadthing_secret
```

### 6. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
floe/
├── app/
│   ├── api/          # API routes
│   ├── auth/         # Auth callback
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Main page
├── components/       # React components
│   ├── AuthProvider.tsx
│   ├── AuthScreen.tsx
│   ├── DeepWork.tsx
│   ├── Navigation.tsx
│   ├── TaskEditor.tsx
│   └── TaskManager.tsx
├── lib/             # Utility functions
│   └── supabase.ts
├── types/           # TypeScript types
│   └── database.ts
├── public/          # Static assets
│   └── bg.jpg       # Background image
└── BG/              # Background images folder
```

## Usage

1. **Authentication**: Enter your email to receive a magic link
2. **Create Projects**: Click the + button in the sidebar to create a new project
3. **Add Tasks**: Select a project and add tasks with rich text details
4. **Deep Work**: Switch to Deep Work mode, select a task, and start a focus session
5. **Timer Presets**: Choose between 25/5 (Classic) or 45/15 (Extended) Pomodoro sessions, or set custom durations

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

## License

MIT
