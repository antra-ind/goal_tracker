# 🎯 Habit Tracker - React App

A personal habit tracking application built with React, TypeScript, and Tailwind CSS. Supports GitHub OAuth login and syncs data to GitHub Gist.

## Features

- ✅ **Daily Routine Tracking** - Spiritual, Health habits with checkboxes
- ✅ **Planned Activities** - Learning, Career, Finance categories with priorities
- ✅ **Weekly Calendar View** - Shows work hours (9-6:15 Mon-Fri) and weekends
- ✅ **Statistics & Streaks** - Track your progress and maintain streaks
- ✅ **GitHub SSO Login** - Sign in with your GitHub account
- ✅ **Cloud Sync** - Data saved to private GitHub Gist
- ✅ **Offline Support** - Works offline, syncs when back online

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create **New OAuth App**
3. Set callback URL: `http://localhost:5173/goal_tracker/callback`
4. Copy Client ID to `.env.local`:

```bash
cp .env.example .env.local
# Edit VITE_GITHUB_CLIENT_ID
```

## Deploy to GitHub Pages

1. Push to GitHub
2. Enable Pages in Settings → GitHub Actions
3. Add secret `GITHUB_CLIENT_ID` in Settings → Secrets

## Tech Stack

React 18 • TypeScript • Vite • Tailwind CSS • GitHub OAuth • GitHub Gist API
