import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  // Log authentication attempt
  console.log('\n[Auth Middleware] Authentication attempt:');
  console.log(`  Path: ${req.method} ${req.path}`);
  console.log(`  Authorization header present: ${!!authHeader}`);
  
  if (authHeader) {
    const headerFormat = authHeader.startsWith('Bearer ') ? 'Bearer <token>' : 'Invalid format';
    console.log(`  Header format: ${headerFormat}`);
  }

  if (!token) {
    console.log('  ❌ Token extraction failed - no token found');
    return res.status(401).json({ error: 'Authentication required' });
  }

  console.log(`  Token length: ${token.length} characters`);
  console.log(`  Token preview: ${token.substring(0, 20)}...`);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    console.log(`  ✅ Token valid - User ID: ${decoded.userId}`);
    next();
  } catch (error: any) {
    console.log(`  ❌ Token validation failed: ${error.name || 'Unknown error'}`);
    if (error.message) {
      console.log(`  Error message: ${error.message}`);
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

