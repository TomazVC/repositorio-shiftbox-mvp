import "react-native-gesture-handler";

import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { NotificationService } from './services/notificationService';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const { body, documentElement } = document;
      const previousBodyOverflow = body.style.overflowY;
      const previousBodyHeight = body.style.height;
      const previousRootHeight = documentElement.style.height;

      body.style.overflowY = 'auto';
      body.style.height = '100%';
      documentElement.style.height = '100%';

      return () => {
        body.style.overflowY = previousBodyOverflow;
        body.style.height = previousBodyHeight;
        documentElement.style.height = previousRootHeight;
      };
    }

    // Configurar notificações
    const setupNotifications = async () => {
      const token = await NotificationService.registerForPushNotifications();
      if (token) {
        console.log('Push token registrado:', token);
      }
    };

    const listeners = NotificationService.setupNotificationListeners();
    setupNotifications();

    return () => {
      NotificationService.removeNotificationListeners(listeners);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

