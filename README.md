# Tako Overlay API

A high-performance scraper API for [Tako](https://tako.id) streamer overlays (Milestone & Leaderboard). Built with **Puppeteer Core** and **@sparticuz/chromium-min**, specifically optimized for **Vercel Serverless Functions**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSatuSattr%2FTako-Overlay-API&env=API_KEY)

## 🚀 Features

- **Milestone Scraping**: Extracts current amount, target, title, and start time.
- **Leaderboard Scraping**: Extracts top rankings (name and formatted amount).
- **Serverless Optimized**: Lightweight Chromium build fits within Vercel's limits.
- **Security**: 
    - Optional protection using `api_key` URL parameter.
    - Input validation for `type` and `overlay_key` (Regex protected).
- **Anti-Bot Measures**: Dynamic **User-Agent Rotation** for every request.
- **Rate Limiting**: Built-in protection (10 requests/min per instance) to prevent abuse.
- **CORS Enabled**: `Access-Control-Allow-Origin: *` supported for browser-based requests.
- **Edge Caching**: 60-second caching for faster responses.

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- Google Chrome or Edge installed (for local testing only)

## 📦 Installation

1.  Clone this repository:
    ```bash
    git clone https://github.com/SatuSattr/Tako-Overlay-API.git
    cd Tako-Overlay-API
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and set your `API_KEY`.

## 💻 Local Usage

### Running the Scraper Directly (CLI)
```bash
# Milestone
node tako-scraper.js milestone "https://tako.id/overlay/milestone?overlay_key=YOUR_KEY"

# Leaderboard
node tako-scraper.js leaderboard "https://tako.id/overlay/leaderboard?overlay_key=YOUR_KEY"
```

### Running the API Locally
```bash
vercel dev
```
API: `http://localhost:3000/api/scrape`

## 🌍 Deployment to Vercel

1. Push to your GitHub repo.
2. Connect to Vercel.
3. Add `API_KEY` in **Settings > Environment Variables**.
4. Set Function Memory to **1024MB** (configured in `vercel.json`).

## 📡 API Documentation

### Endpoint
`GET /api/scrape`

### Parameters
| Parameter | Default | Description |
| :--- | :--- | :--- |
| `overlay_key` | (Required*) | Unique key from Tako.id. (*Not needed for `type=ping`) |
| `type` | `milestone` | `milestone`, `leaderboard`, or `ping`. |
| `api_key` | (Optional) | Required only if `API_KEY` env is set. |

### Example Request
```bash
# Scrape Leaderboard
curl -G "https://your-api.vercel.app/api/scrape" \
     -d "type=leaderboard" \
     -d "overlay_key=vignbq3..." \
     -d "api_key=SECRET"

# Quick Health/Warm-up Check
curl "https://your-api.vercel.app/api/scrape?type=ping"
```

## 🔥 Keep-Warm Strategy (Recommended)

Since Vercel Hobby plan has limited Cron Jobs, use an external service like **[cron-job.org](https://cron-job.org/)** or **UptimeRobot** to ping your API every 5-10 minutes:

**Target URL:** `https://your-api.vercel.app/api/scrape?type=ping`

This lightweight request bypasses Puppeteer and keeps your serverless instance "warm," eliminating Cold Starts.

## ⚠️ Important Notes
- **Timeout**: Vercel Hobby plan limit is 10s-15s. Ensure Tako.id loads quickly.
- **Memory**: Puppeteer requires at least 1024MB RAM for stable execution.

## 📝 License
MIT
