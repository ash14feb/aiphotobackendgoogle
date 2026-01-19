const express = require('express');
const app = express();

// Import your handlers using require
const createPaymentLink = require('./api/createpaymentlink');
const getPaymentLinkDetails = require('./api/getPaymentLinkDetails');
const salesCreate = require('./api/sales/create');
const salesGet = require('./api/sales/get');
const salesStats = require('./api/sales/stats');
const salesUpdate = require('./api/sales/update');

const port = process.env.PORT || 8080;

// Important: Cloud Run needs to parse the JSON body 
// so your 'req.body' isn't empty in create.js
app.use(express.json());

// Routes
app.all('/api/createpaymentlink', createPaymentLink);
app.all('/api/getPaymentLinkDetails', getPaymentLinkDetails);
app.all('/api/sales/create', salesCreate);
app.all('/api/sales/get', salesGet);
app.all('/api/sales/stats', salesStats);
app.all('/api/sales/update', salesUpdate);

// Root health check
app.get('/', (req, res) => res.send('API Server is Live'));

// Listen on 0.0.0.0
app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}`);
});