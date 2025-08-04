import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import dotenv from 'dotenv';

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    username: string;
  };
}

// AWS Cognito
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.COGNITO_USER_POOL_CLIENT_ID!,
});

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token is required',
      message: '認証トークンが必要です。' 
    });
  }

  try {
    // AWS Cognito JWT
    const payload = await verifier.verify(token);
    
    req.user = {
      sub: payload.sub,
      email: payload.email,
      username: payload.username || payload['cognito:username'],
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ 
      error: 'Invalid token',
      message: '無効なトークンです。' 
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const payload = await verifier.verify(token);
    req.user = {
      sub: payload.sub,
      email: payload.email,
      username: payload.username || payload['cognito:username'],
    };
    next();
  } catch (error) {
    next();
  }
}; 