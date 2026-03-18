const { scrapeTakoMilestone, scrapeTakoLeaderboard } = require('../tako-scraper');

// In-memory store for basic rate limiting (per instance)
const rateLimit = new Map();

module.exports = async (req, res) => {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Basic Rate Limiting (10 requests per minute per instance)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    const windowStart = now - 60000;
    
    let userRequests = rateLimit.get(ip) || [];
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (userRequests.length >= 10) {
        return res.status(429).json({ error: 'Too Many Requests. Please wait a minute.' });
    }
    
    userRequests.push(now);
    rateLimit.set(ip, userRequests);

    // 3. Parameter validation
    let { overlay_key, type = 'milestone', api_key: providedApiKey } = req.query;

    // Trik Keep-Warm: Jika type adalah ping, langsung balas tanpa jalankan Puppeteer
    if (type === 'ping') {
        return res.status(200).json({ status: 'warm', timestamp: new Date().toISOString() });
    }

    // Hardening: Validasi tipe agar hanya 'milestone' atau 'leaderboard'
    const allowedTypes = ['milestone', 'leaderboard'];
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid type parameter. Allowed: milestone, leaderboard' });
    }

    // Hardening: Pastikan overlay_key hanya berisi karakter alfanumerik (mencegah path traversal)
    if (overlay_key && !/^[a-zA-Z0-9_-]+$/.test(overlay_key)) {
        return res.status(400).json({ error: 'Invalid overlay_key format.' });
    }

    // 3. Security Layer: API Key Check
    const requiredApiKey = process.env.API_KEY;

    // Hanya cek jika API_KEY didefinisikan di environment variable
    if (requiredApiKey) {
        if (!providedApiKey || providedApiKey !== requiredApiKey) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or missing api_key parameter.' });
        }
    }

    if (!overlay_key) {
        return res.status(400).json({ error: 'Missing overlay_key parameter.' });
    }

    const url = `https://tako.id/overlay/${type}?overlay_key=${overlay_key}`;

    try {
        let data;
        if (type === 'leaderboard') {
            data = await scrapeTakoLeaderboard(url);
        } else {
            data = await scrapeTakoMilestone(url);
        }
        
        // Caching for 60 seconds
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        return res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({ 
            error: `Failed to scrape ${type} data.`,
            message: error.message 
        });
    }
};
