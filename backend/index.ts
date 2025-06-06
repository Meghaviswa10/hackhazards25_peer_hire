import { Hono } from 'hono';
import { authRoutes } from './routes/auth';
import { auth, requireClient, requireFreelancer } from './middleware/auth';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import dotenv from 'dotenv';
import { connect } from 'mongoose';

dotenv.config();

// Log all environment variables (excluding sensitive ones)
console.log('Environment Configuration:');
console.log('------------------------');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '**configured**' : 'missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '**configured**' : 'missing');
console.log('JWT_EXPIRATION:', process.env.JWT_EXPIRATION);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('DEMO_MODE:', process.env.DEMO_MODE);
console.log('------------------------');

// Request logging middleware
const requestLogger = async (c, next) => {
  const start = Date.now();
  const { method, url } = c.req;
  const requestId = crypto.randomUUID();

  console.log(`[${new Date().toISOString()}] ${requestId} -> ${method} ${url}`);

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;
  console.log(
    `[${new Date().toISOString()}] ${requestId} <- ${method} ${url} ${status} ${duration}ms`
  );
};

// Ensure required environment variables are set
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('MONGODB_URI environment variable not set');
  process.exit(1);
}
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('JWT_SECRET environment variable not set');
  process.exit(1);
}
const jwtExpiration = process.env.JWT_EXPIRATION;
if (!jwtExpiration) {
  console.error('JWT_EXPIRATION environment variable not set');
  process.exit(1);
}
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// CORS Configuration
// Get allowed origins from environment variables
// Support both single URL and comma-separated URLs
let frontendURL = process.env.FRONTEND_URL || 'https://hackhazards25-peer-hire.onrender.com';
// Convert to array if comma-separated string
const allowedOrigins = frontendURL.split(',').map(origin => origin.trim());

console.log('Allowed Origins:', allowedOrigins);

const app = new Hono();

// Add request logging middleware before other middleware
app.use('*', requestLogger);

// Setup CORS middleware with support for multiple origins
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Requested-With', 'Origin'],
  exposeHeaders: ['Content-Length', 'X-Powered-By'],
  maxAge: 86400,
  credentials: true,
}));

// Add cache control middleware
app.use('*', async (c, next) => {
  await next();
  if (c.req.method === 'GET') {
    c.header('Cache-Control', 'private, max-age=3600');
  } else {
    c.header('Cache-Control', 'no-store');
  }
});

// Spinup check endpoint
app.get('/spinup', (c) => c.json({ status: 'ok' }));

// Root route for server info
app.get('/', (c) => c.json({
  name: 'PeerHire API',
  version: '1.0.0',
  status: 'running',
  timestamp: new Date().toISOString()
}));

// Health check endpoint with MongoDB connection status
app.get('/healthz', async (c) => {
  try {
    // Check MongoDB connection
    
    return c.json({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      status: 'error',
      error: 'Health check failed'
    }, 500);
  }
});

// MongoDB connection
const connectDB = async () => {
  try {
    await connect(mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};
connectDB();

// Public routes
app.route('/auth', authRoutes);

// Protected routes - require authentication
app.use('/api/*', auth);

// Example protected routes

// Client-only routes
app.get('/api/client/*', requireClient, (c) => {
  return c.json({ message: 'Client  accessible' });
});

// Freelancer-only routes
app.get('/api/freelancer/*', requireFreelancer, (c) => {
  return c.json({ message: 'Freelancer  accessible' });
});

// Default 404 route - must be last
app.notFound((c) => {
  return c.json({ 
    status: 'error',
    message: 'Route not found',
    path: c.req.path
  }, 404);
});

// Start server
export default({
  fetch: app.fetch,
  port,
});
console.log(`Server running on http://localhost:${port}`);