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
- ✅ **GitHub SSO Login** - Secure authentication with your GitHub account
- ✅ **Cloud Sync** - Data automatically saved to private GitHub Gist
- ✅ **Offline Support** - Works offline with localStorage, syncs when online
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173/goal_tracker/

## 🔐 GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create **New OAuth App**
3. Set Homepage URL: `https://antra-ind.github.io/goal_tracker/`
4. Set Callback URL: `https://antra-ind.github.io/goal_tracker/`
5. Copy Client ID and create `.env.local`:

```bash
cp .env.example .env.local
# Add your VITE_GITHUB_CLIENT_ID
```

## 📦 Deploy to GitHub Pages

1. Push code to GitHub
2. Go to Settings → Pages → Source: GitHub Actions
3. Add repository secret `GITHUB_CLIENT_ID` in Settings → Secrets → Actions

The app will auto-deploy on push to `main` branch.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS 4 | Styling |
| GitHub OAuth | Authentication |
| GitHub Gist API | Data Storage |
| Lucide React | Icons |

## 📄 License

MIT © [Antra](https://github.com/antra-ind)

---

<p align="center">Made with ❤️ for personal productivity</p>
