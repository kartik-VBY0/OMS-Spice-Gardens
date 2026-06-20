import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import 'dotenv/config';
import { handleError } from './middleware/errorHandler.js';
import customerRoutes from './routes/customer.routes.js';
import orderRoutes from './routes/order.routes.js';
import { cors } from 'hono/cors';


const app = new Hono();
app.use('*', cors());
app.onError(handleError);

app.route('/customers', customerRoutes);
app.route('/orders', orderRoutes);

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port });
console.log(`Backend running on http://localhost:${port}`);
