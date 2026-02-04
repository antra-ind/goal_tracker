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
- **Visualize your progress** with statistics, charts, and insights
- **Sync across devices** using GitHub as a backend

Built with modern web technologies and designed for privacy - your data stays in your GitHub account.

## ✨ Features

### 📋 Daily Routine Tracking
- Organize habits by categories (spiritual, health, learning, career, finance, family)
- **Two tracking types:**
  - ✓ **Yes/No (Boolean)** - Simple checkbox for done/not done
  - 📊 **Numeric (Analog)** - Track quantities with +/- buttons and progress bar
- Support for various units: glasses, liters, hours, minutes, steps, km, calories, kg, pages, and more
- Set targets with min/max ranges

### 🎯 Planned Activities
- Track tasks with priorities (High/Medium/Low)
- **Flexible recurring options:**
  - One-time tasks with due dates
  - Daily recurring
  - Weekly (specific day)
  - Custom (select specific days like Mon-Fri)
- Visual badges showing recurring pattern

### 📈 Progress & Analytics
- **30-day mini chart** showing daily completion rates
- **Weekly breakdown** with day-by-day view
- **Struggling habits** - Identify habits below 50% completion
- **Strong habits** - Celebrate habits above 80% completion
- **Category performance** - See which areas need attention
- **Planned activities insights** - Track recurring task completion

### 📅 Calendar View
- Weekly calendar with habit overlay
- Work hours visualization
- Navigate between weeks

### ☁️ Cloud Sync
- Auto-sync to GitHub Gist (3-second debounce)
- Works offline with localStorage
- Cross-device sync with same PAT
- No backend server required

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

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript 5.6 | Type Safety |
| Vite 7 | Build Tool |
| Tailwind CSS 4 | Styling |
| date-fns | Date Manipulation |
| @octokit/rest | GitHub API |
| Lucide React | Icons |

## 📱 Supported Units for Numeric Habits

| Category | Units |
|----------|-------|
| 💧 Liquids | glasses, liters, cups |
| ⏰ Time | hours, minutes |
| 🏋️ Fitness | steps, km, miles, reps, sets, calories |
| ⚖️ Weight | kg, lbs |
| 📚 Learning | pages, chapters, lessons |
| 🥗 Health | servings, mg (supplements) |
| 💰 Money | ₹, $ |
| 📊 General | times, %, custom |

## � Roadmap

### ✅ v2.0.0 (Current)
- Daily habit tracking (boolean + numeric)
- Planned activities with recurring options
- GitHub Gist sync across devices
- Google Calendar-style calendar view (day/week)
- Progress analytics and insights
- 15-minute time slots with overlap handling

### 🔮 v3.0.0 (Planned) - AI Task Integration
**Auto-scan Email & Teams for tasks using AI**

#### Features
- 🔗 **Microsoft Graph Integration** - Connect to Outlook & Teams
- 🤖 **AI Task Extraction** - LLM parses emails/messages for action items
- 📅 **Auto-create Activities** - Tasks added with deadlines & categories
- ✅ **Completion Verification** - AI checks if tasks are done based on follow-up messages
- 🔄 **Daily Scan** - Automatic or manual trigger

#### Architecture
```
Microsoft Graph API → Backend (Node.js) → LLM (OpenAI/Claude) → Goal Tracker
     (Email/Teams)        (OAuth)           (Parse tasks)         (Gist)
```

#### Requirements
- Azure AD App Registration (Mail.Read, Chat.Read permissions)
- Backend server (Node.js/Python) for OAuth & API calls
- LLM API key (OpenAI/Anthropic)
- Hosting (Vercel/Railway/self-hosted)

#### Estimated Effort
| Component | Time |
|-----------|------|
| Azure AD Setup | 2-4 hours |
| Backend API | 1-2 days |
| Frontend UI | 4-6 hours |
| Testing | 1 day |

---

## �📄 License

MIT © [Antra](https://github.com/antra-ind)

---

<p align="center">Made with ❤️ for personal productivity</p>
