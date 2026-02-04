# 🎯 Goal Tracker

> A modern, personal goal and habit tracking application to help you build better habits and achieve your goals.

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 About

Goal Tracker is a comprehensive personal productivity tool designed to help you:
- **Track daily habits** across different life areas (spiritual, health, learning, career, finance)
- **Manage planned activities** with priorities and due dates
- **Visualize your progress** with statistics and streaks
- **Sync across devices** using GitHub as a backend

Built with modern web technologies and designed for privacy - your data stays in your GitHub account.

## ✨ Features

- ✅ **Daily Routine Tracking** - Organize habits by categories (spiritual, health, etc.)
- ✅ **Planned Activities** - Track tasks with priorities, due dates, and recurring options
- ✅ **Full CRUD Operations** - Add, edit, and delete habits, activities, and categories
- ✅ **Weekly Calendar View** - Visualize your week with work hours overlay
- ✅ **Statistics & Streaks** - Monitor progress and maintain motivation
- ✅ **Auto-Sync** - Changes automatically sync to GitHub Gist (3s debounce)
- ✅ **Cloud Backup** - Data saved to your private GitHub Gist
- ✅ **Offline Support** - Works offline with localStorage, syncs when online
- ✅ **Cross-Device** - Access from any device with the same PAT
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **No Backend Required** - Pure frontend, deploy anywhere

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173/goal_tracker/

## 🔐 GitHub Sync Setup (Optional)

Sync your data across devices using a GitHub Personal Access Token (PAT):

1. **Generate a PAT:**
   - Go to [GitHub Token Settings](https://github.com/settings/tokens/new?description=Goal%20Tracker&scopes=gist)
   - Select only the **`gist`** scope
   - Click "Generate token"
   - Copy the token (starts with `ghp_...`)

2. **Connect in the app:**
   - Click "Connect GitHub" button
   - Paste your token
   - Done! Your data syncs automatically

> **Note:** The token is stored only in your browser's localStorage. Your data is saved to a private Gist in your GitHub account.

### Using on Multiple Devices

Enter the same PAT on each device - your data will sync automatically!

## 📦 Deploy to GitHub Pages

1. Fork this repository
2. Go to Settings → Pages → Source: **GitHub Actions**
3. Push any change to trigger deployment

The app will auto-deploy on push to `main` branch.

> No secrets or environment variables needed! Authentication is handled client-side with PAT.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS 4 | Styling |
| GitHub PAT | Authentication (optional) |
| GitHub Gist API | Data Storage |
| Lucide React | Icons |

## 📄 License

MIT © [Antra](https://github.com/antra-ind)

---

<p align="center">Made with ❤️ for personal productivity</p>
