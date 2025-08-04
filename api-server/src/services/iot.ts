import * as mqtt from 'aws-iot-device-sdk-v2';
import { mqtt5, iot } from 'aws-iot-device-sdk-v2';
import dotenv from 'dotenv';

dotenv.config();

interface OrderStatusUpdate {
  orderId: string;
  status: string;
  userId: string;
  timestamp: string;
  message: string;
}

class IoTService {
  private client: mqtt5.Mqtt5Client | null = null;
  private isConnected = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      // AWS IoT Core設定
      const config: mqtt5.AwsIotMqtt5ClientConfig = {
        hostName: process.env.AWS_IOT_ENDPOINT!,
        port: 8883,
        connectProperties: {
          keepAliveIntervalSeconds: 30,
          clientId: `coffee-order-server-${Date.now()}`,
        },
        credentials: {
          aws: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          },
        },
        websocket: {
          handshakeTransform: (request, done) => {
            done(request);
          },
        },
      };

      this.client = mqtt5.AwsIotMqtt5Client.newClient(config);

      // 接続
      this.client.on('connectionSuccess', (eventData) => {
        console.log('✅ AWS IoT Core接続成功');
        this.isConnected = true;
        this.subscribeToTopics();
      });

      this.client.on('connectionFailure', (eventData) => {
        console.error('❌ AWS IoT Core接続失敗:', eventData.error);
        this.isConnected = false;
      });

      this.client.on('disconnection', (eventData) => {
        console.log('🔌 AWS IoT Core接続解除');
        this.isConnected = false;
      });

      this.client.on('error', (eventData) => {
        console.error('🚨 AWS IoT Coreエラー:', eventData.error);
      });

      this.client.start();

    } catch (error) {
      console.error('AWS IoT Core初期化エラー:', error);
    }
  }

  private subscribeToTopics() {
    if (!this.client || !this.isConnected) {
      console.warn('MQTTクライアントが接続されていません。');
      return;
    }

    // 注文状況更新トピック
    const subscribeRequest: mqtt5.SubscribeRequest = {
      subscriptions: [
        {
          qos: mqtt5.QoS.AtLeastOnce,
          topicFilter: 'coffee/orders/+/status',
        },
        {
          qos: mqtt5.QoS.AtLeastOnce,
          topicFilter: 'coffee/orders/+/payment',
        },
      ],
    };

    this.client.subscribe(subscribeRequest).then((response) => {
      console.log('MQTTトピック購読成功:', response);
    }).catch((error) => {
      console.error('MQTTトピック購読失敗:', error);
    });

    // メッセージ受信
    this.client.on('messageReceived', (eventData) => {
      this.handleMessage(eventData);
    });
  }

  private handleMessage(eventData: mqtt5.MessageReceivedEvent) {
    try {
      const topic = eventData.message.topicName;
      const payload = JSON.parse(eventData.message.payload.toString());

      console.log('MQTTメッセージ受信:', { topic, payload });

      // トピックに応じたメッセージ処理
      if (topic.includes('/status')) {
        this.handleOrderStatusUpdate(payload);
      } else if (topic.includes('/payment')) {
        this.handlePaymentUpdate(payload);
      }
    } catch (error) {
      console.error('MQTTメッセージ処理エラー:', error);
    }
  }

  private handleOrderStatusUpdate(payload: OrderStatusUpdate) {
    console.log('注文状況更新:', payload);
  }

  private handlePaymentUpdate(payload: any) {
    console.log('決済状況更新:', payload);
  }

  // 注文状況変更通知送信
  public async publishOrderStatusUpdate(orderId: string, status: string, userId: string, message: string) {
    if (!this.client || !this.isConnected) {
      console.warn('MQTTクライアントが接続されていないため、メッセージを送信できません。');
      return;
    }

    const payload: OrderStatusUpdate = {
      orderId,
      status,
      userId,
      timestamp: new Date().toISOString(),
      message,
    };

    const publishRequest: mqtt5.PublishRequest = {
      topicName: `coffee/orders/${orderId}/status`,
      payload: JSON.stringify(payload),
      qos: mqtt5.QoS.AtLeastOnce,
    };

    try {
      await this.client.publish(publishRequest);
      console.log('注文状況更新送信成功:', payload);
    } catch (error) {
      console.error('注文状況更新送信失敗:', error);
    }
  }

  // 決済状況変更通知送信
  public async publishPaymentUpdate(orderId: string, paymentStatus: string, userId: string, message: string) {
    if (!this.client || !this.isConnected) {
      console.warn('MQTTクライアントが接続されていないため、メッセージを送信できません。');
      return;
    }

    const payload = {
      orderId,
      paymentStatus,
      userId,
      timestamp: new Date().toISOString(),
      message,
    };

    const publishRequest: mqtt5.PublishRequest = {
      topicName: `coffee/orders/${orderId}/payment`,
      payload: JSON.stringify(payload),
      qos: mqtt5.QoS.AtLeastOnce,
    };

    try {
      await this.client.publish(publishRequest);
      console.log('決済状況更新送信成功:', payload);
    } catch (error) {
      console.error('決済状況更新送信失敗:', error);
    }
  }

  // 接続状況確認
  public isClientConnected(): boolean {
    return this.isConnected;
  }

  // 接続解除
  public async disconnect() {
    if (this.client) {
      await this.client.stop();
      this.isConnected = false;
      console.log('AWS IoT Core接続解除完了');
    }
  }
}

const iotService = new IoTService();

export default iotService; 