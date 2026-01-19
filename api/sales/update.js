import { query } from '../../lib/db.js';

// CORS helper matching your other API files
const addCorsHeaders = (res, origin = "*") => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
};

export default async function handler(req, res) {
    // Always add CORS headers
    addCorsHeaders(res, req.headers.origin || "*");

    // Handle preflight (OPTIONS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only allow PUT
    if (req.method !== 'PUT') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { id, ...updateData } = req.body;

        console.log('🔄 Update request:', { id, updateData });

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Valid ID is required'
            });
        }

        // Check if record exists
        const [existingSale] = await query(
            'SELECT * FROM PhotoAISales WHERE ID = ?',
            [id]
        );

        if (!existingSale) {
            return res.status(404).json({
                success: false,
                error: 'Sale record not found'
            });
        }

        // Build dynamic UPDATE query
        const updates = [];
        const values = [];

        // Define allowed fields
        const allowedFields = ['ThemeName', 'Amount', 'PhotoURL', 'OriginalImageURL', 'DateTime'];

        // Process each field
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updates.push(`${field} = ?`);

                if (field === 'OriginalImageURL' && updateData[field] === '') {
                    // Convert empty string to null
                    values.push(null);
                } else if (field === 'Amount') {
                    // Ensure Amount is a number
                    values.push(parseFloat(updateData[field]));
                } else {
                    values.push(updateData[field]);
                }
            }
        });

        // If no valid fields to update
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields provided for update'
            });
        }

        // Add UpdatedAt timestamp (if your schema has it)
        updates.push('UpdatedAt = CURRENT_TIMESTAMP');

        // Add ID for WHERE clause
        values.push(id);

        const sql = `UPDATE PhotoAISales SET ${updates.join(', ')} WHERE ID = ?`;

        console.log('🔧 Update SQL:', sql);
        const result = await query(sql, values);

        // Fetch the updated record
        const [updatedSale] = await query(
            'SELECT * FROM PhotoAISales WHERE ID = ?',
            [id]
        );

        return res.status(200).json({
            success: true,
            message: 'Sale record updated successfully',
            data: updatedSale,
            updatedFields: updates.filter(field => !field.includes('UpdatedAt')).map(field => field.split(' = ')[0])
        });

    } catch (error) {
        console.error('❌ Error updating sale:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update sale record',
            details: error.message
        });
    }
}