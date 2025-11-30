import jwt from 'jsonwebtoken';

// Single source of truth for JWT_SECRET - used by both token generation and verification
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

