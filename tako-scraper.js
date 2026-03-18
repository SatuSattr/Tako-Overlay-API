const chromium = require('@sparticuz/chromium-min');
const puppeteer = require('puppeteer-core');

/**
 * Shared browser launcher logic
 */
async function getBrowser() {
    const isLocal = process.platform === 'win32' || process.platform === 'darwin';
    
    let executablePath;
    if (isLocal) {
        executablePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    } else {
        // Fix for Vercel: Download chromium from remote if not found locally
        executablePath = await chromium.executablePath(
            `https://github.com/Sparticuz/chromium/releases/download/v${await chromium.version}/chromium-v${await chromium.version}-pack.tar`
        );
    }

    return await puppeteer.launch({
        args: isLocal ? [] : chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: isLocal ? true : chromium.headless,
        ignoreHTTPSErrors: true,
    });
}

/**
 * Scrapes milestone data
 */
async function scrapeTakoMilestone(url) {
    let browser = null;
    try {
        browser = await getBrowser();
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('iframe', { timeout: 10000 });
        
        const frameHandle = await page.$('iframe');
        const frame = await frameHandle.contentFrame();
        await frame.waitForSelector('#scraping-data', { timeout: 10000 });

        return await frame.evaluate(() => {
            const el = document.querySelector('#scraping-data');
            return {
                type: 'milestone',
                title: el.getAttribute('data-title'),
                current: el.getAttribute('data-current'),
                formattedCurrent: el.getAttribute('data-formatted-current'),
                target: el.getAttribute('data-target'),
                formattedTarget: el.getAttribute('data-formatted-target'),
                startDate: el.getAttribute('data-start-date'),
                startTime: el.getAttribute('data-start-time'),
                timestamp: new Date().toISOString()
            };
        });
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * Scrapes leaderboard data
 */
async function scrapeTakoLeaderboard(url) {
    let browser = null;
    try {
        browser = await getBrowser();
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('iframe', { timeout: 10000 });
        
        const frameHandle = await page.$('iframe');
        const frame = await frameHandle.contentFrame();
        
        // Menunggu textarea yang berisi JSON data
        await frame.waitForSelector('#scraping-data-raw', { timeout: 10000 });

        return await frame.evaluate(() => {
            const rawEl = document.getElementById('scraping-data-raw');
            const infoEl = document.getElementById('scraping-data');
            
            let rankings = [];
            try {
                rankings = JSON.parse(rawEl.value);
            } catch (e) {
                rankings = [];
            }

            return {
                type: 'leaderboard',
                title: infoEl ? infoEl.getAttribute('data-title') : 'Leaderboard',
                rankings: rankings,
                timestamp: new Date().toISOString()
            };
        });
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeTakoMilestone, scrapeTakoLeaderboard };

// CLI Test
if (require.main === module) {
    const type = process.argv[2] || 'milestone';
    const testUrl = process.argv[3] || 'https://tako.id/overlay/milestone?overlay_key=vignbq3i4qekmi4rwaml5keo';
    
    const action = type === 'leaderboard' ? scrapeTakoLeaderboard : scrapeTakoMilestone;
    
    action(testUrl)
        .then(data => console.log('Scraped Data:', JSON.stringify(data, null, 2)))
        .catch(err => console.error('Test Failed:', err));
}
