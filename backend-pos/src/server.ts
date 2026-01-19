import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDB } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import professionalRoutes from './routes/professionalRoutes';
import studentRoutes from './routes/studentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app: Application = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors({ origin: config.cors.origin, credentials: true })); // CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Health check
app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'PlacementOS API is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API Routes
const API_PREFIX = `/api/${config.apiVersion}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/jobs`, jobRoutes);
app.use(`${API_PREFIX}/applications`, applicationRoutes);
app.use(`${API_PREFIX}/assessments`, assessmentRoutes);
app.use(`${API_PREFIX}/professionals`, professionalRoutes);
app.use(`${API_PREFIX}/students`, studentRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

// Welcome route
app.get('/', (_: Request, res: Response) => {
  res.json({
    message: 'Welcome to PlacementOS API',
    version: config.apiVersion,
    documentation: '/api-docs',
    health: '/health',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      PlacementOS API Server            ║
║                                        ║
║  Environment: ${config.env.padEnd(27)}║
║  Port: ${PORT.toString().padEnd(32)}║
║  API Version: ${config.apiVersion.padEnd(26)}║
║                                        ║
║  Server running at:                    ║
║  http://localhost:${PORT}                ║
║                                        ║
║  API Base URL:                         ║
║  http://localhost:${PORT}/api/${config.apiVersion}       ║
╚════════════════════════════════════════╝
  `);
});

export default app;
