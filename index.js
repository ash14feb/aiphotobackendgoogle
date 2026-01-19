import express from 'express';

// Import Handlers
import createPaymentLinkHandler from './api/createpaymentlink.js';
import getPaymentLinkDetailsHandler from './api/getPaymentLinkDetails.js';
import salesCreateHandler from './api/sales/create.js';
import salesGetHandler from './api/sales/get.js';
import salesStatsHandler from './api/sales/stats.js';
import salesUpdateHandler from './api/sales/update.js';

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// --- ROUTES ---

// Payment Routes
app.all('/api/createpaymentlink', createPaymentLinkHandler);
app.all('/api/getPaymentLinkDetails', getPaymentLinkDetailsHandler);

// Sales Routes
app.all('/api/sales/create', salesCreateHandler);
app.all('/api/sales/get', salesGetHandler);
app.all('/api/sales/stats', salesStatsHandler);
app.all('/api/sales/update', salesUpdateHandler);

// Health Check for Cloud Run
app.get('/', (req, res) => {
    res.status(200).send('API Server is running');
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});