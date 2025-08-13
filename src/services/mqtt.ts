import mqtt from 'mqtt';

interface OrderStatusUpdate {
  orderId: string;
  status: string;
  userId: string;
  timestamp: string;
  message: string;
}

interface PaymentUpdate {
  orderId: string;
  paymentStatus: string;
  userId: string;
  timestamp: string;
  message: string;
}

class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private isConnected = false;
  private messageHandlers: Map<string, Function[]> = new Map();

  constructor() {
    // WebSocket経由のMQTT接続 (AWS IoT Core WebSocketエンドポイント使用)
    this.connect();
  }

  private connect() {
    try {
      // AWS IoT Core WebSocketエンドポイント
      const wsEndpoint = process.env.VITE_AWS_IOT_ENDPOINT || 'localhost:8080';
      const clientId = `coffee-order-client-${Date.now()}`;
      
      const url = `ws://${wsEndpoint}/mqtt`;

      this.client = mqtt.connect(url, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });

      this.client.on('connect', () => {
        console.log('MQTTクライアント接続成功');
        this.isConnected = true;
        this.subscribeToTopics();
      });

      this.client.on('message', (topic: string, message: Buffer) => {
        this.handleMessage(topic, message);
      });

      this.client.on('error', (error: Error) => {
        console.error('MQTTクライアントエラー:', error);
      });

      this.client.on('close', () => {
        console.log('MQTTクライアント接続解除');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('MQTTクライアント初期化エラー:', error);
    }
  }

  private subscribeToTopics() {
    if (!this.client || !this.isConnected) {
      console.warn('MQTTクライアントが接続されていません。');
      return;
    }

    // 注文状況更新トピック購読
    this.client.subscribe('coffee/orders/+/status', (err: Error | null) => {
      if (err) {
        console.error('注文状況トピック購読失敗:', err);
      } else {
        console.log('注文状況トピック購読成功');
      }
    });

    // 決済状況更新トピック購読
    this.client.subscribe('coffee/orders/+/payment', (err: Error | null) => {
      if (err) {
        console.error('決済状況トピック購読失敗:', err);
      } else {
        console.log('決済状況トピック購読成功');
      }
    });
  }

  private handleMessage(topic: string, message: Buffer) {
    try {
      const payload = JSON.parse(message.toString());
      console.log('MQTTメッセージ受信:', { topic, payload });

      // トピックに応じたメッセージ処理
      if (topic.includes('/status')) {
        this.notifyHandlers('orderStatus', payload as OrderStatusUpdate);
      } else if (topic.includes('/payment')) {
        this.notifyHandlers('paymentStatus', payload as PaymentUpdate);
      }
    } catch (error) {
      console.error('MQTTメッセージ処理エラー:', error);
    }
  }

  // メッセージハンドラー登録
  public on(event: string, handler: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)!.push(handler);
  }

  // メッセージハンドラー削除
  public off(event: string, handler: Function) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // ハンドラーにメッセージ通知
  private notifyHandlers(event: string, data: any) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('メッセージハンドラー実行エラー:', error);
        }
      });
    }
  }

  // 接続状況確認
  public isClientConnected(): boolean {
    return this.isConnected;
  }

  // 接続解除
  public disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
      console.log('MQTTクライアント接続解除完了');
    }
  }
}

// シングルトンインスタンス作成
const mqttService = new MQTTService();

export default mqttService; 

