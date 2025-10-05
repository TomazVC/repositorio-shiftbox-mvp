import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiService } from './api';

// Configurar como as notificações serão exibidas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Notificações push devem ser testadas em dispositivo físico');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return false;
    }

    return true;
  }

  static async registerForPushNotifications(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);

      // Configurar canal para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#04BF55',
        });
      }

      return token;
    } catch (error) {
      console.error('Erro ao registrar para notificações push:', error);
      return null;
    }
  }

  static async sendTokenToServer(token: string, userId: string): Promise<void> {
    try {
      await apiService.post('/notifications/register-token', {
        token,
        user_id: userId,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Erro ao enviar token para servidor:', error);
    }
  }

  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    triggerSeconds?: number
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: triggerSeconds 
        ? { seconds: triggerSeconds } as any
        : null,
    });

    return notificationId;
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static setupNotificationListeners() {
    // Listener para quando a notificação é recebida com o app em foreground
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
    });

    // Listener para quando o usuário toca na notificação
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificação tocada:', response);
      // TODO: Navegar para tela específica baseada nos dados da notificação
    });

    return {
      receivedListener,
      responseListener,
    };
  }

  static removeNotificationListeners(listeners: {
    receivedListener: Notifications.Subscription;
    responseListener: Notifications.Subscription;
  }) {
    listeners.receivedListener.remove();
    listeners.responseListener.remove();
  }
}