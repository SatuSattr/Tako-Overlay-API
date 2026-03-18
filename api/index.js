module.exports = async (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'Tako Overlay API',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        endpoints: {
            scrape: '/api/scrape'
        },
        message: 'API is healthy and ready to scrape.'
    });
};
