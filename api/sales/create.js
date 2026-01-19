// 1. In 'type: module', you must use import instead of require
// Note: You may need to add '.js' to the end of your local file paths
import { query } from '../../lib/db.js'; 
import { validateSalesData } from '../../utils/validation.js';

// CORS helper
const addCorsHeaders = (res, origin = "*") => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
};

// 2. Changed to export default
export default async function handler(req, res) {
    // Always add CORS headers
    addCorsHeaders(res, req.headers.origin || "*");

    // Handle preflight (OPTIONS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const salesData = req.body;

        // Validate input
        const { error, value } = validateSalesData(salesData);

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        // Prepare data for insertion
        const { ThemeName, Amount, PhotoURL, OriginalImageURL, DateTime } = value;

        const result = await query(
            `INSERT INTO PhotoAISales (ThemeName, Amount, PhotoURL, OriginalImageURL, DateTime) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                ThemeName,
                Amount,
                PhotoURL,
                OriginalImageURL || null,
                DateTime || new Date().toISOString().slice(0, 19).replace('T', ' ')
            ]
        );

        // Fetch the created record
        const [newSale] = await query(
            'SELECT * FROM PhotoAISales WHERE ID = ?',
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: 'Sale record created successfully',
            data: newSale
        });

    } catch (error) {
        console.error('Error creating sale:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create sale record',
            details: error.message
        });
    }
}