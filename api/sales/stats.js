import { query } from '../../lib/db.js';

// CORS helper matching your other API files
const addCorsHeaders = (res, origin = "*") => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
};

export default async function handler(req, res) {
    // Always add CORS headers
    addCorsHeaders(res, req.headers.origin || "*");

    // Handle preflight (OPTIONS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { period = 'month' } = req.query; // day, week, month, year

        // Get total sales
        const [totalResult] = await query(
            'SELECT COUNT(*) as count, SUM(Amount) as total FROM PhotoAISales'
        );

        // Get sales by theme
        const themeStats = await query(
            'SELECT ThemeName, COUNT(*) as count, SUM(Amount) as total FROM PhotoAISales GROUP BY ThemeName ORDER BY total DESC'
        );

        // Get recent sales
        const recentSales = await query(
            'SELECT * FROM PhotoAISales ORDER BY DateTime DESC LIMIT 10'
        );

        // Get daily/monthly trends
        let trendQuery = '';
        if (period === 'day') {
            trendQuery = `SELECT DATE(DateTime) as date, COUNT(*) as count, SUM(Amount) as total 
                         FROM PhotoAISales 
                         WHERE DateTime >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
                         GROUP BY DATE(DateTime) 
                         ORDER BY date`;
        } else if (period === 'month') {
            trendQuery = `SELECT DATE_FORMAT(DateTime, '%Y-%m') as month, COUNT(*) as count, SUM(Amount) as total 
                         FROM PhotoAISales 
                         GROUP BY DATE_FORMAT(DateTime, '%Y-%m') 
                         ORDER BY month DESC LIMIT 12`;
        }

        const trendStats = trendQuery ? await query(trendQuery) : [];

        return res.status(200).json({
            success: true,
            stats: {
                total: totalResult,
                byTheme: themeStats,
                recent: recentSales,
                trends: trendStats
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            details: error.message
        });
    }
}