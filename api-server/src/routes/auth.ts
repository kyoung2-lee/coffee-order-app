import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    username: string;
  };
}

const router = Router();

// ユーザープロフィル取得
router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    res.json({
      success: true,
      data: {
        id: req.user.sub,
        email: req.user.email,
        username: req.user.username,
      },
      message: 'ユーザープロフィルを正常に取得しました。'
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

// ユーザー情報更新
router.put('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    res.json({
      success: true,
      message: 'ユーザー情報が正常に更新されました。'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

// トークン検証
router.post('/verify', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'トークンが有効です。',
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

export default router; 