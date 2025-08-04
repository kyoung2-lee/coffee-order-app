import React, { useState, useEffect } from 'react';
import mqttService from '../services/mqtt';

interface Notification {
  id: string;
  type: 'orderStatus' | 'paymentStatus';
  title: string;
  message: string;
  timestamp: Date;
  orderId?: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // MQTTメッセージハンドラー登録
    const handleOrderStatus = (data: any) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'orderStatus',
        title: '注文状況更新',
        message: data.message,
        timestamp: new Date(),
        orderId: data.orderId,
      };
      addNotification(notification);
    };

    const handlePaymentStatus = (data: any) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'paymentStatus',
        title: '決済状況更新',
        message: data.message,
        timestamp: new Date(),
        orderId: data.orderId,
      };
      addNotification(notification);
    };

    mqttService.on('orderStatus', handleOrderStatus);
    mqttService.on('paymentStatus', handlePaymentStatus);

    // コンポーネントアンマウント時にイベントリスナー削除
    return () => {
      mqttService.off('orderStatus', handleOrderStatus);
      mqttService.off('paymentStatus', handlePaymentStatus);
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // 最大5個の通知を維持
    setIsVisible(true);

    // 5秒後に通知を自動削除
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'orderStatus':
        return 'order';
      case 'paymentStatus':
        return 'payment';
      default:
        return 'info';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'orderStatus':
        return 'bg-blue-500';
      case 'paymentStatus':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationColor(notification.type)} text-white p-4 rounded-lg shadow-lg max-w-sm animate-slide-in`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-xl">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
                {notification.orderId && (
                  <p className="text-xs mt-1 opacity-75">注文ID: {notification.orderId}</p>
                )}
                <p className="text-xs mt-1 opacity-75">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-white hover:text-gray-200 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter; 