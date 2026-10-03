# DisciplineOS — Deployment & GitHub Guide

This guide provides step-by-step instructions to upload DisciplineOS to GitHub and deploy it to production platforms like **Render**, **Railway**, **Vercel**, or **Docker**.

---

## 1. Uploading to GitHub

### Step 1: Verify Git Status & Secret Protection
DisciplineOS is pre-configured with a strict `.gitignore` that automatically excludes `.env`, `node_modules/`, and build artifacts.

Check that `.env` files are ignored:
```bash
git status
```
Verify that `server/.env` is NOT listed under untracked files.

### Step 2: Commit Your Code
```bash
git add .
git commit -m "feat: complete DisciplineOS with conversational JARVIS AI and production build setup"
```

### Step 3: Create a GitHub Repository & Push
1. Go to [github.com/new](https://github.com/new) and create a repository (e.g., `discipline-os`).
2. Run the following commands in your terminal:
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
git push -u origin main
```

---

## 2. Deploying to Production (Render.com — Recommended)

Render allows you to host the backend and frontend together on a free/starter plan with automatic SSL.

### Method A: Single Full-Stack Web Service (Easiest)

1. Sign up / Log in to [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure the settings:
   - **Name**: `discipline-os`
   - **Region**: Choose closest to you (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (monorepo root)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run build:all
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: Free or Starter
5. Add **Environment Variables** in the Render dashboard:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations & static asset serving |
   | `PORT` | `10000` | Render assigns port dynamically |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | *(Random 32-char string)* | e.g. `discipline_os_prod_secret_2026_xyz` |
   | `JWT_REFRESH_SECRET` | *(Random 32-char string)* | e.g. `discipline_os_prod_refresh_2026_abc` |
   | `CLIENT_URL` | `https://your-service.onrender.com` | Your live Render domain |
   | `AI_PROVIDER` | `gemini` | Or `openai` |
   | `AI_MODEL` | `gemini-3.8-flash` | Or `gpt-4o-mini` |
   | `GEMINI_API_KEY` | `AQ.Ab8RN6IE...` | Your Google Gemini API Key |

6. Click **Deploy Web Service**.

---

### Method B: Decoupled (Vercel Frontend + Render Backend)

#### Deploy Backend on Render:
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Add `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.
- Set `CLIENT_URL` to your Vercel URL.

#### Deploy Frontend on Vercel:
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Add a `vercel.json` rewrites file in `client/` if needed to proxy `/api` requests to your Render backend URL.

---

## 3. Deploying to Railway.app

1. Sign up on [Railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `discipline-os` repository.
4. Click **Add Plugin** → **MongoDB** (or use your existing MongoDB Atlas URI).
5. In **Variables**, add:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=${{MongoDB.MONGO_URL}}`
   - `JWT_SECRET=discipline_os_secret_2026`
   - `AI_PROVIDER=gemini`
   - `AI_MODEL=gemini-3.8-flash`
   - `GEMINI_API_KEY=your_key_here`
6. In **Settings**, set Build Command to:
   ```bash
   npm run build:all
   ```
   and Start Command to:
   ```bash
   npm start
   ```

---

## 4. Deploying with Docker

DisciplineOS includes a complete multi-container setup in `docker-compose.yml`:

```bash
# Build and start all services (Client + Server + MongoDB)
docker-compose up --build -d

# View running container logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 5. Free Cloud Database Setup (MongoDB Atlas)

If you don't already have a cloud MongoDB database:
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free **M0 Sandbox** cluster.
3. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
4. In **Database Access**, create a user with read/write privileges (e.g. `discipline_admin`).
5. Click **Connect** → **Drivers** → Copy connection string:
   ```
   mongodb+srv://discipline_admin:<password>@cluster0.xyz.mongodb.net/disciplineos?retryWrites=true&w=majority
   ```
6. Paste this URI as `MONGO_URI` in your production environment settings.
