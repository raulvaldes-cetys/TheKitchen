import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import restaurantRoutes from './routes/restaurants';
import foodItemRoutes from './routes/foodItems';
import cartRoutes from './routes/carts';
import userRoutes from './routes/user';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter((origin): origin is string => typeof origin === 'string');

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true, // Allow all origins if no specific ones are set
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request/Response logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log incoming request
  console.log('\n' + '='.repeat(80));
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  console.log(`Origin: ${req.get('origin') || 'N/A'}`);
  
  // Log Authorization header (mask token for security)
  const authHeader = req.get('authorization');
  if (authHeader) {
    const tokenPreview = authHeader.startsWith('Bearer ') 
      ? `Bearer ${authHeader.substring(7, 20)}...` 
      : 'Bearer <missing>';
    console.log(`Authorization: ${tokenPreview}`);
  } else {
    console.log('Authorization: <not provided>');
  }

  // Log request body (exclude sensitive fields)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) {
      sanitizedBody.password = '***REDACTED***';
    }
    console.log('Request Body:', JSON.stringify(sanitizedBody, null, 2));
  }

  // Capture response data
  const originalSend = res.send;
  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    
    // Log response
    console.log(`[${timestamp}] ${req.method} ${req.path} - Status: ${res.statusCode} (${duration}ms)`);
    
    // Log response body (truncate if too long)
    if (body) {
      try {
        const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
        const bodyStr = JSON.stringify(responseBody, null, 2);
        if (bodyStr.length > 500) {
          console.log('Response Body:', bodyStr.substring(0, 500) + '... (truncated)');
        } else {
          console.log('Response Body:', bodyStr);
        }
      } catch (e) {
        // Not JSON, log as-is (truncated)
        const bodyStr = String(body);
        console.log('Response Body:', bodyStr.length > 500 ? bodyStr.substring(0, 500) + '...' : bodyStr);
      }
    }
    
    console.log('='.repeat(80) + '\n');
    
    return originalSend.call(this, body);
  };

  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/food-items', foodItemRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

