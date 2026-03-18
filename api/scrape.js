const { scrapeTakoMilestone, scrapeTakoLeaderboard } = require('../tako-scraper');

module.exports = async (req, res) => {
    // 1. Method check
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Security Layer: API Key Check
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
        console.error('SERVER ERROR: API_KEY is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key.' });
    }

    // 3. Parameter validation
    const { overlay_key, type = 'milestone' } = req.query;

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
