import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import iotService from '../services/iot';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    username: string;
  };
}

interface OrderItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const router = Router();

// 一時注文保 (db)
let orders: Order[] = [];

// 注文作成
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid order items',
        message: '注文項目が正しくありません。' 
      });
    }

    // 注文総額計算
    const totalAmount = items.reduce((sum: number, item: OrderItem) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // 新注文作成
    const newOrder: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user.sub,
      items,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    orders.push(newOrder);

    // IoT通知送信
    await iotService.publishOrderStatusUpdate(
      newOrder.id,
      newOrder.status,
      req.user!.sub,
      '新しい注文が作成されました。'
    );

    res.status(201).json({
      success: true,
      data: newOrder,
      message: '注文が正常に作成されました。'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

// ユーザー注文一覧取得
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    const userOrders = orders.filter(order => order.userId === req.user!.sub);

    res.json({
      success: true,
      data: userOrders,
      message: '注文一覧を正常に取得しました。'
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

// 特定注文取得
router.get('/:orderId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    const { orderId } = req.params;
    const order = orders.find(o => o.id === orderId && o.userId === req.user!.sub);

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        message: '該当する注文が見つかりません。' 
      });
    }

    res.json({
      success: true,
      data: order,
      message: '注文を正常に取得しました。'
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

// 注文状況更新 (管理者用)
router.patch('/:orderId/status', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: '有効でない注文状況です。' 
      });
    }

    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        message: '該当する注文が見つかりません。' 
      });
    }

    order.status = status;
    order.updatedAt = new Date();

    // IoT通知送信
    const statusMessages = {
      'confirmed': '注文が確認されました。',
      'preparing': 'コーヒー製造を開始します。',
      'ready': '注文が準備されました。',
      'completed': '注文が完了しました。',
      'cancelled': '注文がキャンセルされました。'
    };

    await iotService.publishOrderStatusUpdate(
      order.id,
      status,
      order.userId,
      statusMessages[status as keyof typeof statusMessages] || '注文状況が更新されました。'
    );

    res.json({
      success: true,
      data: order,
      message: '注文状況が正常に更新されました。'
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

// 注文キャンセル
router.delete('/:orderId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    const { orderId } = req.params;
    const order = orders.find(o => o.id === orderId && o.userId === req.user!.sub);

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        message: '該当する注文が見つかりません。' 
      });
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ 
        error: 'Cannot cancel order',
        message: 'キャンセルできない注文状況です。' 
      });
    }

    order.status = 'cancelled';
    order.updatedAt = new Date();

    res.json({
      success: true,
      message: '注文が正常にキャンセルされました。'
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

export default router; 