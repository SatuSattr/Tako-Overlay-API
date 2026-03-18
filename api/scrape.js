const { scrapeTakoMilestone, scrapeTakoLeaderboard } = require('../tako-scraper');

module.exports = async (req, res) => {
    // 1. Method check
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Parameter validation
    let { overlay_key, type = 'milestone', api_key: providedApiKey } = req.query;

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
