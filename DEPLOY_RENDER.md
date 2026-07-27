# Deploy PHOENIX on Render

This app (Express + Socket.IO + SQLite) works on **Render Web Services**, not Vercel.

## One-time setup (about 10 minutes)

### 1. Put the code on GitHub

If you don’t have a repo yet:

1. Create a new **empty** GitHub repository (e.g. `phoenix`).
2. On your PC, in `C:\BHAVAN\teamManagement`:

```powershell
cd C:\BHAVAN\teamManagement
git init
git add .
git commit -m "Prepare PHOENIX for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/phoenix.git
git push -u origin main
```

### 2. Create the service on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and sign up / log in (GitHub login is easiest).
2. **New** → **Blueprint**  
   - Or **New** → **Web Service** and connect the GitHub repo.
3. If using Blueprint: select the repo that contains `render.yaml`.
4. If using Web Service manually:
   - **Runtime:** Docker  
   - **Dockerfile path:** `./Dockerfile`  
   - **Instance type:** Free  
5. Add env var (if not auto-generated):
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = any long random string (32+ characters)
6. Click **Create Web Service** / **Apply**.

### 3. Open your site

When the build finishes, Render shows a URL like:

`https://phoenix-xxxx.onrender.com`

Login:

| Username | Password     |
|----------|--------------|
| `admin`  | `password123`|

---

## Important free-tier notes

- **Cold start:** Free services sleep after ~15 minutes idle. First visit can take 30–60 seconds.
- **SQLite data:** On free plan, disk is **ephemeral**. Redeploys can wipe chat/users (admin is re-seeded on start). For permanent data later, add a **Render Disk** or switch to Postgres.
- **Not for Vercel:** Socket.IO + SQLite need a real always-on (or long-running) web service like Render.

## Local check before deploy

```powershell
cd C:\BHAVAN\teamManagement
npm install
npm start
```

Open http://localhost:3000
