import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());
const angularApp = new AngularNodeAppEngine();

/**
 * PayChangu Integration Endpoints
 */
app.post('/api/paychangu/initialize', async (req, res) => {
  try {
    const { amount, email, first_name, last_name, callback_url, return_url, userId } = req.body;
    const secretKey = process.env['PAYCHANGU_SECRET_KEY'];

    if (!secretKey) {
      return res.status(500).json({ error: 'PayChangu Secret Key not configured' });
    }

    const tx_ref = `upg-${userId}-${Date.now()}`;

    const response = await fetch('https://api.paychangu.com/payment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        amount,
        currency: 'MWK',
        email,
        first_name,
        last_name,
        callback_url,
        return_url,
        tx_ref,
        customization: {
          title: 'Educate MW Premium',
          description: 'Payment for premium educational content'
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (error) {
    console.error('PayChangu Initialization Error:', error);
    return res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

app.post('/api/paychangu/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('PayChangu Webhook Received:', payload);

    // PayChangu sends status in the payload
    if (payload.status === 'success' || payload.event === 'payment.success') {
      const txRef = payload.tx_ref || payload.data?.tx_ref;
      
      if (txRef && txRef.startsWith('upg-')) {
        const userId = txRef.split('-')[1];
        
        // Update User Pro Status in Firestore
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { 
          isPro: true,
          premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year or until exams
        });

        // Record Revenue
        await addDoc(collection(db, 'revenue'), {
          userId,
          amount: payload.amount || payload.data?.amount || 5000,
          currency: 'MWK',
          status: 'completed',
          tx_ref: txRef,
          createdAt: new Date()
        });

        console.log(`User ${userId} upgraded to Pro via PayChangu`);
      }
    }

    return res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Webhook Processing Error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
