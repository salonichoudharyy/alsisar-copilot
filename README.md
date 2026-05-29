# Alsisar Impact Co-Pilot — Deployment Guide

## Project Structure
```
alsisar-deploy/
├── index.html          ← Frontend (password-protected)
├── api/
│   └── chat.js         ← Secure backend (hides API key)
├── vercel.json         ← Vercel routing config
├── .env.example        ← Environment variable template
└── README.md
```

## Deploy to Vercel (Step by Step)

### 1. Install Vercel CLI (one-time)
```bash
npm install -g vercel
```

### 2. Deploy
```bash
cd alsisar-deploy
vercel
```
Follow the prompts — choose "No" for existing project, name it `alsisar-impact-copilot`.

### 3. Set Environment Variables in Vercel Dashboard
Go to: vercel.com → Your Project → Settings → Environment Variables

Add these two:

| Name | Value |
|------|-------|
| `OPENROUTER_API_KEY` | `sk-or-xxxx` (your OpenRouter key) |
| `APP_PASSWORD` | `alsisar-2024` (or whatever you choose) |

### 4. Redeploy after adding env vars
```bash
vercel --prod
```

Or in Vercel dashboard → Deployments → Redeploy.

---

## Security Features
- ✅ API key NEVER exposed to browser
- ✅ Password required to access app
- ✅ Rate limiting: max 15 requests/minute per IP
- ✅ Session-based auth (clears on browser close)
- ✅ Input validation & length limits

## Changing the Password
1. Go to Vercel → Settings → Environment Variables
2. Update `APP_PASSWORD`
3. Redeploy

## How Founders Access It
Just share:
- **URL**: `https://alsisar-impact-copilot.vercel.app`
- **Password**: whatever you set as `APP_PASSWORD`

That's it. No API keys, no setup needed on their end.
