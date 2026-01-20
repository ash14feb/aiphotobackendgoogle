import { query } from '../../lib/db.js';

// CORS helper matching createpaymentlink.js
const addCorsHeaders = (res, origin = "*") => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
};

export default async function handler(req, res) {
    // Always add CORS headers
    addCorsHeaders(res, req.headers.origin || "*");
    console.log('HTTP Method:', req.method);

    // Handle preflight (OPTIONS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only allow GET
    // Only allow GET or HEAD
    //if (req.method !== 'GET' && req.method !== 'HEAD') {
    //    return res.status(405).json({
    //        success: false,
    //        error: 'Method not allowed'
    //    });
    //}

    // For HEAD requests, just return headers
    if (req.method === 'HEAD') {
        return res.status(200).end();
    }

    try {
        const {
            id,
            theme,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            hasOriginalImage
        } = req.query;

        let sql = 'SELECT * FROM PhotoAISales WHERE 1=1';
        const params = [];

        console.log('📊 Request query params:', req.query);

        if (id) {
            sql += ' AND ID = ?';
            params.push(id);
        }

        if (theme) {
            sql += ' AND ThemeName LIKE ?';
            params.push(`%${theme}%`);
        }

        if (startDate) {
            sql += ' AND DateTime >= ?';
            params.push(startDate);
        }

        if (endDate) {
            sql += ' AND DateTime <= ?';
            params.push(endDate);
        }

        if (minAmount) {
            sql += ' AND Amount >= ?';
            params.push(parseFloat(minAmount));
        }

        if (maxAmount) {
            sql += ' AND Amount <= ?';
            params.push(parseFloat(maxAmount));
        }

        if (hasOriginalImage === 'true') {
            sql += ' AND OriginalImageURL IS NOT NULL';
        } else if (hasOriginalImage === 'false') {
            sql += ' AND OriginalImageURL IS NULL';
        }

        sql += ' ORDER BY DateTime DESC, ID DESC';

        console.log('🔍 Executing SQL:', sql);
        console.log('🔍 With params:', params);

        const sales = await query(sql, params);

        console.log('✅ Found', sales.length, 'records');

        return res.status(200).json({
            success: true,
            data: sales,
            count: sales.length
        });

    } catch (error) {
        console.error('❌ Error in GET /sales:', {
            message: error.message,
            code: error.code,
            sql: error.sql
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to fetch sales data',
            details: error.message
        });
    }
}
}