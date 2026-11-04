import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';
import { ZodError } from 'zod';

// Load environment variables
dotenv.config();

// Middleware imports
import { apiLimiter } from './middleware/rateLimit';

// Route imports
import authRoutes from './routes/auth';
import propertiesRoutes from './routes/properties';
import adminPropertiesRoutes from './routes/admin/properties';
import adminUsersRoutes from './routes/admin/users';
import adminDashboardRoutes from './routes/admin/dashboard';
import adminSettingsRoutes from './routes/admin/settings';
import enquiriesRoutes from './routes/enquiries';
import favouritesRoutes from './routes/favourites';
import uploadRoutes from './routes/upload';
import chatbotRoutes from './routes/chatbot';
import locationsRoutes from './routes/locations';
import notificationsRoutes from './routes/notifications';
import draftsRoutes from './routes/drafts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS Configuration
const frontendOrigins = frontendUrl.split(',').map((u) => u.trim());
const allowedOrigins = [
  ...frontendOrigins,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.supabase.co') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all during development or customize strictly in production
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Health Check Endpoints (Exempt from rate limiting)
app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Sasta Plots Marketplace API',
    version: '1.0.0',
  });
});

// Root informational endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Sasta Plots API',
    description: 'Backend API for Sasta Plots Real Estate Marketplace',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// 5. Global API Rate Limiter
app.use('/api', apiLimiter);

// 6. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/admin/properties', adminPropertiesRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/enquiries', enquiriesRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/drafts', draftsRoutes);

// 7. 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 8. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'File size exceeds maximum allowed limit (10MB).',
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Handle standard errors
  console.error('Unhandled server error:', err);
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Express Server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Sasta Plots API running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

export default app;
