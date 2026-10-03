# DisciplineOS 🎯

> **A Complete Production-Grade MERN Stack Consistency & Lifestyle Operating System**  
> *"Build discipline. Maintain consistency. Understand why you fail. Recover without guilt."*

[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-green.svg)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)

---

## ⚡ The Philosophy

Most productivity apps promote **toxic perfectionism**: miss a single day, and your streak resets to zero, triggering shame and abandonment. 

**DisciplineOS is built around behavioral psychology:**
- **Consistency > Perfection**: A missed day does not erase neurological habit wiring. Your 30-day consistency percentage matters more than an unbroken streak.
- **Recovery > Guilt**: If you miss multiple days, **Recovery Mode** temporarily reduces targets by 50% for 3 days so you can restart with zero friction.
- **Bad Day Mode**: On exhausting days, 1-click strips away demanding tasks and provides gentle survival baselines (hydrate, 5-minute walk, rest).
- **The Momentum Loop**: `PLAN → ACT → TRACK → REFLECT → ADJUST → REPEAT`

---

## 🚀 Key Features

| Module | Description |
| :--- | :--- |
| **NOW / NEXT Priority Engine** | Instantly answers *"What should I do right now?"* on the home dashboard to eliminate decision paralysis. |
| **Numeric & Binary Habit Tracker** | Log binary habits, minutes, hours, pages, reps, or km with live completion percentages and progress bars. |
| **Forgiving Streak Engine** | Tracks current streak, best streak, and long-term 30-day consistency percentage without shame. |
| **Deep Work Pomodoro Timer** | Built-in focus timer (25/5, custom) with audio chime, distraction counter, and direct contribution to habit logs. |
| **365-Day Consistency Heatmap** | GitHub-style contribution matrix visualizing habit completions, focus minutes, and day-by-day inspections. |
| **Gentle Recovery Mode** | Automatically detects missed streaks or allows manual trigger to halve habit targets for 3 days to restart momentum. |
| **Bad Day Mode** | One-click button that strips away high-stress demands and offers low-friction survival baselines. |
| **Adaptive Habit Calibration** | Suggests realistic target reductions when completion is consistently low over 7–14 days, with 1-click acceptance. |
| **Long-Term Goals & Milestones** | Define ambitious outcomes, link daily driving habits, and celebrate milestone completions. |
| **Time-Blocked Daily Planner** | Schedule tasks with time, priority, estimated duration, and goal associations. |
| **Daily Evening Reflection** | Log what went well, friction/distractions (Social media, YouTube, fatigue), mood, and energy ratings (1–5). |
| **Weekly Review Cadence** | Generates an automated **KEEP / IMPROVE / NEXT WEEK** review to optimize habits week over week. |
| **Discipline Score (100 pts)** | Transparent behavioral momentum index breaking down Habits (40), Focus (25), Planner (20), and Review (15). |
| **JARVIS AI Coach** | **J**ourney **A**ssistant for **R**outine, **V**ision, **I**mprovement & **S**elf-discipline. Deeply integrated personal habit, discipline, planning, reflection, and recovery coach with action execution, voice input, memory, and 100% offline capability. |
| **Personal Rules & Habit Stacking** | Create behavioral principles (*"Never miss twice"*) and *"After X, I will do Y"* cue-action pairings. |
| **Full Authentication & Security** | JWT tokens, password hashing with bcrypt, Helmet security, rate limiting, and account settings. |

---

## 🤖 JARVIS: A Truly Conversational AI Discipline & Life Coach

> **JARVIS**: **J**ourney **A**ssistant for **R**outine, **V**ision, **I**mprovement & **S**elf-discipline  
> **Architecture Spec**: For in-depth engineering details, refer to [JARVIS_ARCHITECTURE.md](docs/JARVIS_ARCHITECTURE.md).

JARVIS behaves like a real conversational AI assistant (ChatGPT-grade), **NOT** a predefined chatbot or keyword matcher. You can talk naturally about your studies, goals, routines, procrastination, failures, distractions, and daily life.

### Dynamic Conversational Flow
`Natural Language → AI Understanding → Context Retrieval → Reasoning → Natural Response → Authorized Action`

- **Dynamic Multi-Turn Reasoning**: No hardcoded `if (message.includes(...))` rules. The LLM reasons over your active habits, tasks, focus logs, and reflections dynamically.
- **Real-Time Token Streaming**: Streams tokens live via Server-Sent Events (`/api/jarvis/chat/stream`) with typing animations, markdown rendering, and a real-time abort ("Stop Generating") controller.
- **Multi-Provider AI Architecture**:
  - **OpenAI**: Native support for `gpt-4o-mini`, `gpt-4o`, Groq, and DeepSeek.
  - **Google Gemini**: Native support for `gemini-1.5-flash` and `gemini-1.5-pro`.
  - **Local Models**: Support for local Ollama / LMStudio via OpenAI-compatible endpoints (`OPENAI_BASE_URL`).
  - **Fallback Mode**: Transparent developer fallback when API keys are absent—clearly explains setup without fake intelligence.
- **Strict Server-Side Tool Authorization**:
  - 21 formal JSON-schema tools (`getUserProfile`, `getTodayOverview`, `getHabitHistory`, `startFocusSession`, etc.).
  - The model **never** receives or provides `userId` or raw database queries; authorization is strictly scoped by verified JWT tokens on the backend.
- **Interactive Action Confirmation**:
  - Differentiates read-only tools from mutating tools (`createHabit`, `createGoal`, `createTask`, `activateRecoveryMode`).
  - Mutating actions present an interactive confirmation card (**Confirm**, **Edit**, **Cancel**) and only execute when explicitly approved.
- **Two-Tier Memory System**:
  - **Short-Term Context**: Active conversation thread window.
  - **Long-Term Memory**: Persistent store for preferences, study routines, and personal rules with full user privacy controls (View, Delete, Clear All, Toggle).
- **Procrastination & Failure Coaching**:
  - Grounded in behavioral science: breaks tasks down into 5–10 minute micro-starts instead of empty hype or toxic positivity.
  - Analyzes habit drop-offs with statistical honesty, distinguishing correlation from proven causation.
- **ChatGPT-Grade UI**:
  - Clean conversational sidebar with chat history, rename, delete, search, and new chat.
  - Markdown tables, checklists, code blocks, copy response, regenerate, speech-to-text mic input, and audio read-aloud.
  - Ambient access from the Dashboard card and floating launcher across all pages.


---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **React 18** + **Vite 6**
- **Tailwind CSS** (Custom dark mode & typography)
- **Lucide React** (Crisp vector icons)
- **Recharts** (Interactive consistency charts & focus analytics)
- **Axios** (With interceptors and error handling)
- **Canvas Confetti** (Micro-celebrations on habit completion)
- **Web Audio API** (Clean synthesized Pomodoro completion bells)

### Backend (`/server`)
- **Node.js 22** + **Express.js**
- **MongoDB** + **Mongoose ODM**
- **JWT (JSON Web Tokens)** + **Bcrypt.js** password hashing
- **Helmet**, **CORS**, and **Express Rate Limit**
- **Zod** request validation middleware
- **Node.js Native Test Runner**

---

## 📂 Project Architecture

```
Habit_Tracker/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI & Feature widgets
│   │   │   ├── common/         # Navbar, Sidebar, Button, Modal, Confetti
│   │   │   ├── dashboard/      # NowNextCard, DisciplineScoreCard, StreakCard, QuickActionsBar
│   │   │   ├── habits/         # HabitModal, HabitLogModal, HabitAdaptationAlert
│   │   │   ├── focus/          # PomodoroTimer with sound & distraction counter
│   │   │   ├── planner/        # TaskModal, DailySchedule
│   │   │   ├── reflection/     # DailyReflectionModal
│   │   │   ├── calendar/       # HeatmapGrid, DayDetailModal
│   │   │   └── goals/          # GoalModal, MilestoneChecklist
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/              # Landing, Dashboard, Habits, Planner, Focus, Calendar, Goals, Analytics, etc.
│   │   ├── services/           # Axios API modules (auth, habits, tasks, focus, analytics, AI)
│   │   ├── layouts/            # AppLayout (Responsive sidebar + navbar)
│   │   ├── App.jsx             # React Router configuration
│   │   └── index.css           # Tailwind design tokens & sleek scrollbars
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express.js Backend API
│   ├── config/                 # db.js, env.js
│   ├── controllers/            # auth, habit, task, focus, goal, reflection, review, recovery, analytics
│   ├── middleware/             # authMiddleware, errorMiddleware, rateLimiter, validateRequest
│   ├── models/                 # User, Habit, HabitLog, Goal, Task, FocusSession, DailyReflection, etc.
│   ├── routes/                 # Express API routes
│   ├── services/               # streakService, scoreService, aiCoachService, achievementService
│   ├── scripts/                # seed.js (Generates 45 days of realistic data & demo user)
│   ├── tests/                  # Integration tests for auth and habit logging
│   └── server.js               # Express application entry point
├── docker-compose.yml          # Multi-container orchestration (Mongo, Backend, Frontend)
├── Dockerfile.server
├── Dockerfile.client
├── package.json                # Monorepo root script runner
└── README.md
```

---

## 💻 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)
- [MongoDB](https://www.mongodb.com) running locally on port 27017, or a MongoDB Atlas URI.

---

### Step 1: Clone and Install Dependencies

```powershell
# From the project root (Habit_Tracker)
npm run install:all
```
*(On Windows PowerShell, if scripts are restricted, run `npm.cmd run install:all`)*

---

### Step 2: Seed Realistic Demo Data

DisciplineOS includes an automated seed script that creates a demo user with **45 days of realistic habit logs, focus sessions, reflections, goals, and rules**:

```powershell
npm run seed
```

**Demo Account Credentials:**
- **Email:** `demo@disciplineos.com`
- **Password:** `password123`

---

### Step 3: Run the Application

You can start both the backend server (port 5000) and frontend client (port 5173) simultaneously:

```powershell
npm run dev
```

Or run them in separate terminals:

```powershell
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

Open your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🐳 Running with Docker Compose

DisciplineOS is fully containerized. You can run MongoDB, the Node.js backend, and the production-built React frontend via Docker:

```bash
docker compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **MongoDB:** `localhost:27017`

---

## 🧪 Running Tests

Run the backend integration test suite:

```powershell
npm test
```

---

## 🔑 Environment Variables

The project comes pre-configured for local development. For customized deployments, configure `.env` in `/server`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for Express backend |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/disciplineos` | MongoDB connection URI |
| `JWT_SECRET` | `discipline_os_jwt_super_secret_key_2026_xyz` | Secret key for access tokens |
| `JWT_REFRESH_SECRET` | `discipline_os_refresh_secret_key_2026_abc` | Secret key for refresh tokens |
| `CLIENT_URL` | `http://localhost:5173` | Allowed origin for CORS |
| `AI_API_KEY` | *(Optional)* | OpenAI API key for AI Coach (uses fallback if empty) |

---

## 📡 API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create user account
- `POST /api/auth/login` — Sign in and receive JWT
- `POST /api/auth/logout` — Clear session
- `GET  /api/auth/me` — Get authenticated profile
- `PUT  /api/auth/profile` — Update preferences & life areas
- `POST /api/auth/onboarding` — Save onboarding preferences

### Habits (`/api/habits`)
- `GET    /api/habits` — Get user habits with today's completion status
- `POST   /api/habits` — Create new habit with custom units & frequencies
- `PUT    /api/habits/:id` — Edit habit
- `DELETE /api/habits/:id` — Archive or permanently delete habit
- `POST   /api/habits/:id/log` — Record numeric progress, completion %, mood, and notes
- `POST   /api/habits/:id/adaptation/accept` — Apply AI/system reduced target recommendation

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard` — Retrieves NOW/NEXT actions, today's disciplines, score breakdown, and streaks.

### Focus Mode (`/api/focus`)
- `POST /api/focus/complete` — Record completed Pomodoro or custom session
- `GET  /api/focus/history` — Get recent focus sessions
- `GET  /api/focus/stats` — Total hours, today's minutes, and distraction counts

### Recovery & Bad Day (`/api/recovery`)
- `GET  /api/recovery/status` — Inspect active recovery and missed day checks
- `POST /api/recovery/activate` — Temporarily lower habit targets by 50% for 3 days
- `POST /api/recovery/complete` — Restore standard targets
- `POST /api/recovery/bad-day` — Toggle survival mode for difficult days

### Reflections & Reviews (`/api/reflections`, `/api/reviews`)
- `POST /api/reflections` — Save daily evening reflection
- `GET  /api/reviews/generate` — Generate weekly KEEP / IMPROVE / NEXT WEEK report

### Analytics (`/api/analytics`)
- `GET /api/analytics/overview?range=30d` — 7d/30d/90d/1y completion & focus charts
- `GET /api/analytics/heatmap` — 365-day GitHub-style consistency grid
- `GET /api/analytics/day/:date` — Detailed day inspection (habits, focus, reflection)

---

## 🎯 Verification Checklist

- [x] Full authentication with register, login, logout, profile update, and account deletion.
- [x] Multi-step interactive onboarding flow with skip option.
- [x] Main Dashboard with immediate "NOW / NEXT" action prioritization.
- [x] Habit management with custom frequencies (daily, weekdays, specific days) and numeric targets (minutes, pages, reps, km).
- [x] Habit logging with actual vs target calculation, streak recalculation, and notes.
- [x] Forgiving streak system with 30-day consistency calculation.
- [x] Pomodoro focus timer with live circular countdown, distraction logging, and habit auto-contribution.
- [x] 365-Day GitHub-style consistency heatmap with date inspection drawer.
- [x] Recovery Mode with automated missed day detection and 50% target reduction.
- [x] Bad Day Mode with 1-click low-friction survival routine.
- [x] Adaptive habit proposal with 1-click friction reduction.
- [x] Daily Planner time-blocking with priority tags.
- [x] Daily evening reflections and distraction pattern analytics.
- [x] Weekly review generator using Keep / Improve / Next Week framework.
- [x] Personal rules and "After X, I will do Y" habit stacking.
- [x] Transparent Discipline Score (100 pts) with component breakdown.
- [x] Data-grounded AI Coach providing empathetic observations and recommendations.
- [x] Milestone achievements and in-app notifications.
- [x] Full responsive mobile drawer navigation and dark mode toggle.
- [x] Docker & Docker Compose support with MongoDB, server, and client.
- [x] Automated integration test suite.
- [x] One-click demo user login with 45 days of rich pre-seeded data.

---

## 📄 License
This project is licensed under the MIT License.
