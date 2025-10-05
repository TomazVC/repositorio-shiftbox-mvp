import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS } from '../constants';
import { RootStackParamList, NotificationData, NotificationType } from '../types';

type NotificationsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Notifications'
>;

type Props = {
  navigation: NotificationsNavigationProp;
};

export default function Notifications({ navigation }: Props) {
  const [notifications, setNotifications] = useState<NotificationData[]>([
    {
      id: '1',
      type: 'PAYMENT',
      title: 'Pagamento recebido',
      message: 'Você recebeu R$ 42,50 de rendimentos do pool de investimentos.',
      timestamp: '2024-10-05T10:30:00Z',
      read: false,
      action: { label: 'Ver extrato', route: 'Transactions' },
    },
    {
      id: '2',
      type: 'SCORE',
      title: 'Score atualizado',
      message: 'Seu score de crédito aumentou 15 pontos! Agora você tem acesso a taxas melhores.',
      timestamp: '2024-10-04T15:45:00Z',
      read: false,
      action: { label: 'Ver score', route: 'CreditScore' },
    },
    {
      id: '3',
      type: 'INVESTMENT',
      title: 'Nova oportunidade',
      message: 'A taxa do pool aumentou para 8.5% a.a. Considere aumentar seu investimento.',
      timestamp: '2024-10-04T09:15:00Z',
      read: true,
      action: { label: 'Investir', route: 'Invest' },
    },
    {
      id: '4',
      type: 'LOAN',
      title: 'Empréstimo aprovado',
      message: 'Seu empréstimo de R$ 3.000 foi aprovado e liberado em sua carteira.',
      timestamp: '2024-10-03T14:20:00Z',
      read: true,
    },
    {
      id: '5',
      type: 'SECURITY',
      title: 'Login de novo dispositivo',
      message: 'Detectamos um login em um novo dispositivo. Se não foi você, entre em contato conosco.',
      timestamp: '2024-10-02T20:10:00Z',
      read: true,
    },
    {
      id: '6',
      type: 'SYSTEM',
      title: 'Manutenção programada',
      message: 'O sistema ficará indisponível das 2h às 4h da madrugada para manutenção.',
      timestamp: '2024-10-01T18:00:00Z',
      read: true,
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Implementar carregamento real das notificações
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'PAYMENT': return 'cash';
      case 'INVESTMENT': return 'trending-up';
      case 'LOAN': return 'bank';
      case 'SCORE': return 'chart-line';
      case 'SYSTEM': return 'cog';
      case 'SECURITY': return 'shield-alert';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'PAYMENT': return COLORS.SUCCESS;
      case 'INVESTMENT': return COLORS.PRIMARY;
      case 'LOAN': return COLORS.INFO;
      case 'SCORE': return COLORS.PRIMARY;
      case 'SYSTEM': return COLORS.TEXT_SECONDARY;
      case 'SECURITY': return COLORS.WARNING;
      default: return COLORS.TEXT_SECONDARY;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      'Excluir notificação',
      'Deseja excluir esta notificação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev =>
              prev.filter(notification => notification.id !== notificationId)
            );
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: NotificationData) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.action) {
      navigation.getParent()?.navigate(notification.action.route);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = (notification: NotificationData) => {
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationCard,
          !notification.read && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(notification)}
        onLongPress={() => deleteNotification(notification.id)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={[
              styles.notificationIcon,
              { backgroundColor: `${getNotificationColor(notification.type)}15` }
            ]}>
              <MaterialCommunityIcons
                name={getNotificationIcon(notification.type)}
                size={24}
                color={getNotificationColor(notification.type)}
              />
            </View>
            <View style={styles.notificationInfo}>
              <Text style={[
                styles.notificationTitle,
                !notification.read && styles.unreadTitle,
              ]}>
                {notification.title}
              </Text>
              <Text style={styles.notificationTimestamp}>
                {formatTimestamp(notification.timestamp)}
              </Text>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>
          
          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>

          {notification.action && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
                {notification.action.label}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={COLORS.PRIMARY}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Notificações</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread Count */}
      {unreadCount > 0 && (
        <View style={styles.unreadCountContainer}>
          <Text style={styles.unreadCountText}>
            {unreadCount} {unreadCount === 1 ? 'nova notificação' : 'novas notificações'}
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={64}
              color={COLORS.TEXT_SECONDARY}
            />
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptyMessage}>
              Você será notificado sobre pagamentos, atualizações de score e outras informações importantes.
            </Text>
          </View>
        ) : (
          notifications.map(renderNotification)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_SCREEN,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.XL,
    paddingBottom: SPACING.BASE,
  },
  backButton: {
    padding: SPACING.SM,
  },
  pageTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.BASE,
  },
  markAllButton: {
    padding: SPACING.SM,
  },
  markAllText: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  unreadCountContainer: {
    backgroundColor: COLORS.BG_MUTED,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.LG,
  },
  unreadCountText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING['2XL'],
    gap: SPACING.SM,
  },
  notificationCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    marginTop: SPACING.SM,
    ...COMPONENTS.CARD_SHADOW,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  notificationContent: {
    gap: SPACING.SM,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.BASE,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationTimestamp: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY,
    marginLeft: SPACING.SM,
    marginTop: SPACING.XS,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
    marginLeft: 64, // Align with title
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 64, // Align with message
    marginTop: SPACING.XS,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginRight: SPACING.XS,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2XL'],
    paddingHorizontal: SPACING.LG,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
});