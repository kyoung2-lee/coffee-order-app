import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth';
import iotService from '../services/iot';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    username: string;
  };
}

const router = Router();

// Stripe初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// 決済作成
router.post('/create-payment-intent', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    const { amount, currency = 'krw', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: '有効でない決済金額です。' 
      });
    }

    // Stripe Payment作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      metadata: {
        userId: req.user.sub,
        orderId: orderId || '',
        userEmail: req.user.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      },
      message: '決済が正常に作成されました。'
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      error: 'Payment creation failed',
      message: '決済作成に失敗しました。' 
    });
  }
});

// 決済確認
router.post('/confirm-payment', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        error: 'Payment intent ID required',
        message: '決済意図IDが必要です。' 
      });
    }

    // Payment取得
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // 決済成功時にIoT通知送信
      const orderId = paymentIntent.metadata.orderId;
      if (orderId) {
        await iotService.publishPaymentUpdate(
          orderId,
          'succeeded',
          req.user!.sub,
          '決済が正常に完了しました。'
        );
      }

      res.json({
        success: true,
        data: {
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        },
        message: '決済が正常に完了しました。'
      });
    } else {
      // 決済失敗時にIoT通知送信
      const orderId = paymentIntent.metadata.orderId;
      if (orderId) {
        await iotService.publishPaymentUpdate(
          orderId,
          'failed',
          req.user!.sub,
          '決済に失敗しました。'
        );
      }

      res.status(400).json({
        success: false,
        error: 'Payment not completed',
        message: '決済が完了していません。',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      error: 'Payment confirmation failed',
      message: '決済確認に失敗しました。' 
    });
  }
});

// 決済キャンセル
router.post('/cancel-payment', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        error: 'Payment intent ID required',
        message: '決済意図IDが必要です。' 
      });
    }

    // Paymentキャンセル
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    res.json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      },
      message: '決済が正常にキャンセルされました。'
    });
  } catch (error) {
    console.error('Payment cancellation error:', error);
    res.status(500).json({ 
      error: 'Payment cancellation failed',
      message: '決済キャンセルに失敗しました。' 
    });
  }
});

// 決済状況確認
router.get('/status/:paymentIntentId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: '認証されていないユーザーです。' 
      });
    }

    const { paymentIntentId } = req.params;

    // Payment取得
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata
      },
      message: '決済状況を正常に確認しました。'
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ 
      error: 'Payment status check failed',
      message: '決済状況確認に失敗しました。' 
    });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', failedPayment.id);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

export default router; 