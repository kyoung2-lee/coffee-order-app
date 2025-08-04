import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    username: string;
  };
}

const router = Router();

// サンプルコーヒーメニューデータ
const coffeeMenu = [
  {
    id: 1,
    name: 'アメリカーノ',
    description: 'すっきりとした濃厚なエスプレッソ',
    price: 450,
    category: 'coffee',
    image: '/images/americano.jpg',
    available: true
  },
  {
    id: 2,
    name: 'カフェラテ',
    description: 'まろやかなミルクとエスプレッソの調和',
    price: 550,
    category: 'coffee',
    image: '/images/latte.jpg',
    available: true
  },
  {
    id: 3,
    name: 'カプチーノ',
    description: 'エスプレッソ、スチームミルク、ミルクフォームの完璧な調和',
    price: 550,
    category: 'coffee',
    image: '/images/cappuccino.jpg',
    available: true
  },
  {
    id: 4,
    name: 'カフェモカ',
    description: 'チョコレートとエスプレッソの甘い出会い',
    price: 600,
    category: 'coffee',
    image: '/images/mocha.jpg',
    available: true
  },
  {
    id: 5,
    name: 'バニララテ',
    description: 'バニラシロップが入った甘いラテ',
    price: 600,
    category: 'coffee',
    image: '/images/vanilla-latte.jpg',
    available: true
  },
  {
    id: 6,
    name: 'キャラメルマキアート',
    description: 'キャラメルシロップが入った甘いコーヒー',
    price: 600,
    category: 'coffee',
    image: '/images/caramel-macchiato.jpg',
    available: true
  }
];

// 全メニュー取得
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: coffeeMenu,
      message: 'メニューを正常に取得しました。'
    });
  } catch (error) {
    console.error('Menu fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

// 特定メニュー取得
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const menuId = parseInt(req.params.id);
    const menuItem = coffeeMenu.find(item => item.id === menuId);

    if (!menuItem) {
      return res.status(404).json({ 
        error: 'Menu item not found',
        message: '該当するメニューが見つかりません。' 
      });
    }

    res.json({
      success: true,
      data: menuItem,
      message: 'メニューを正常に取得しました。'
    });
  } catch (error) {
    console.error('Menu item fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

// カテゴリ別メニュー取得
router.get('/category/:category', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = req.params.category;
    const filteredMenu = coffeeMenu.filter(item => item.category === category);

    res.json({
      success: true,
      data: filteredMenu,
      message: `${category}カテゴリのメニューを正常に取得しました。`
    });
  } catch (error) {
    console.error('Category menu fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました。' 
    });
  }
});

export default router; 