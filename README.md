# Tako Overlay API

A high-performance scraper API for [Tako](https://tako.id) streamer overlays (Milestone & Leaderboard). Built with **Puppeteer Core** and **@sparticuz/chromium-min**, specifically optimized for **Vercel Serverless Functions**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSatuSattr%2FTako-Overlay-API&env=API_KEY)

## 🚀 Features

- **Milestone Scraping**: Extracts current amount, target, title, and start time.
- **Leaderboard Scraping**: Extracts the top rankings (name and formatted amount) from the custom HTML overlay.
- **Serverless Optimized**: Uses a lightweight Chromium build to stay within Vercel's 50MB function limit.
- **Security**: Optional protection using an `api_key` URL parameter to prevent unauthorized public access.
- **Edge Caching**: Responses are cached for 60 seconds to reduce browser launches and improve speed.

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

You can test the scraper without the API layer using:

```bash
# To test Milestone
node tako-scraper.js milestone "https://tako.id/overlay/milestone?overlay_key=YOUR_KEY"

# To test Leaderboard
node tako-scraper.js leaderboard "https://tako.id/overlay/leaderboard?overlay_key=YOUR_KEY"
```

### Running the API Locally

Use the [Vercel CLI](https://vercel.com/docs/cli) for the best experience:

```bash
vercel dev
```

The API will be available at `http://localhost:3000/api/scrape`.

## 🌍 Deployment to Vercel

### Option 1: Vercel CLI (Fastest)

1. Login to Vercel: `vercel login`
2. Deploy: `vercel`
3. Add your `API_KEY` in the Vercel Dashboard under **Settings > Environment Variables**.

### Option 2: GitHub Integration (Recommended)

1. Push this code to a private GitHub repository.
2. Connect the repository to Vercel.
3. Add the `API_KEY` environment variable during the setup.
4. Vercel will automatically deploy every time you push to the `main` branch.

## 📡 API Documentation

### Endpoint

`GET /api/scrape`

### Parameters

| Parameter     | Default     | Description                                                                 |
| :------------ | :---------- | :-------------------------------------------------------------------------- |
| `overlay_key` | (Required)  | The unique key from your Tako.id overlay URL.                               |
| `type`        | `milestone` | Can be `milestone` or `leaderboard`.                                        |
| `api_key`     | (Optional)  | Required **only if** `API_KEY` environment variable is set in the provider. |

### Example Request

```bash
# With API Key (if configured)
curl -G "https://your-project.vercel.app/api/scrape" \
     -d "type=leaderboard" \
     -d "overlay_key=vignbq3i4qekmi4rwaml5keo" \
     -d "api_key=your_secret_api_key_here"

# Without API Key (if NO environment variable is set)
curl -G "https://your-project.vercel.app/api/scrape" \
     -d "type=milestone" \
     -d "overlay_key=vignbq3i4qekmi4rwaml5keo"
```

## ⚠️ Important Notes

- **Timeout**: The default Vercel Hobby timeout is 10s. If the scraper takes longer, consider upgrading to Pro or optimizing the `waitUntil` settings in `tako-scraper.js`.
