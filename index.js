import express from 'express';
import createPaymentLinkHandler from './api/createPaymentLink.js';
import createPaymentLinkHandler from './api/getPaymentLinkDetails.js';
import createPaymentLinkHandler from './api/getPaymentLinkDetails.js';

import createHandler from './api/sales/create.js';

import getHandler from './api/sales/get.js';

import statHandler from './api/sales/stat.js';
import updateHandler from './api/sales/update.js';


const app = express();
const port = process.env.PORT || 8080;

// 1. Enable JSON body parsing (Required because your handler uses req.body)
//Test
app.use(express.json());

// 2. Define your routes
// We use .all() to let your handler manage GET/POST/OPTIONS logic itself
app.all('/api/createpaymentlink', createPaymentLinkHandler);
app.all('/api/getPaymentLinkDetails', getPaymentLinkDetailsHandler);
app.all('/api/sales/create', createHandler);
app.all('/api/sales/get', getHandler);
app.all('/api/sales/stat', statHandler);
app.all('/api/sales/update', updateHandler);




// 3. Start the server (This is what Cloud Run was missing!)
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});