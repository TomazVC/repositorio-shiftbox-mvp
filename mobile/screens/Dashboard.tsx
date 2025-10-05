import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, PoolStatus, Transaction } from '../types';
import { authService } from '../services/authService';
import { walletService } from '../services/walletService';
import { poolService } from '../services/poolService';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS, CURRENCY, TRANSACTION_TYPES } from '../constants';

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

type Props = {
  navigation: DashboardScreenNavigationProp;
};

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type QuickAction = {
  icon: MaterialIconName;
  label: string;
  onPress: () => void;
};

const transactionIcons: Record<string, MaterialIconName> = {
  [TRANSACTION_TYPES.DEPOSITO]: 'arrow-down-bold-circle',
  [TRANSACTION_TYPES.SAQUE]: 'arrow-up-bold-circle',
  [TRANSACTION_TYPES.INVESTIMENTO]: 'finance',
  [TRANSACTION_TYPES.EMPRESTIMO_RECEBIDO]: 'bank',
  [TRANSACTION_TYPES.PAGAMENTO_EMPRESTIMO]: 'cash-minus',
  [TRANSACTION_TYPES.RENDIMENTO]: 'trending-up',
  [TRANSACTION_TYPES.RESGATE_INVESTIMENTO]: 'cash-refund',
  [TRANSACTION_TYPES.AJUSTE_SALDO]: 'tune-variant',
  [TRANSACTION_TYPES.CANCELAMENTO_INVESTIMENTO]: 'cancel',
};

export default function Dashboard({ navigation }: Props) {
  const [userName, setUserName] = useState('Usuário');
  const [walletBalance, setWalletBalance] = useState(0);
  const [poolStatus, setPoolStatus] = useState<PoolStatus | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user?.id) {
        throw new Error('Não foi possível identificar o usuário.');
      }

      setUserName(user.full_name ?? user.email ?? 'Usuário');

      const wallet = await walletService.getWalletByUser(user.id);
      setWalletBalance(wallet.saldo);

      const [pool, transactions] = await Promise.all([
        poolService.getPoolStatus(),
        walletService.getTransactions({ walletId: wallet.id }),
      ]);

      setPoolStatus(pool);
      setRecentTransactions(transactions.slice(0, 3));
    } catch (error: any) {
      console.warn('Erro ao carregar dashboard:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        icon: 'chart-line',
        label: 'Aplicar no pool',
        onPress: () => navigation.navigate('Invest'),
      },
      {
        icon: 'finance',
        label: 'Meus investimentos',
        onPress: () => navigation.getParent()?.navigate('InvestmentDetails'),
      },
      {
        icon: 'bank-outline',
        label: 'Solicitar empréstimo',
        onPress: () => navigation.getParent()?.navigate('LoanRequest'),
      },
      {
        icon: 'bell-outline',
        label: 'Notificações',
        onPress: () => navigation.getParent()?.navigate('Notifications'),
      },
    ], [navigation]
  );

  const renderTransactionRow = (transaction: Transaction) => {
    const iconName = transactionIcons[transaction.tipo] ?? 'swap-horizontal';
    const isPositive = transaction.tipo === TRANSACTION_TYPES.DEPOSITO ||
      transaction.tipo === TRANSACTION_TYPES.EMPRESTIMO_RECEBIDO ||
      transaction.tipo === TRANSACTION_TYPES.RENDIMENTO ||
      transaction.tipo === TRANSACTION_TYPES.RESGATE_INVESTIMENTO ||
      transaction.tipo === TRANSACTION_TYPES.AJUSTE_SALDO;

    return (
      <View key={transaction.id} style={styles.transactionRow}>
        <View style={styles.transactionIconBubble}>
          <MaterialCommunityIcons
            name={iconName}
            size={22}
            color={isPositive ? COLORS.SUCCESS : COLORS.ERROR}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionLabel} numberOfLines={1}>
            {transaction.descricao || 'Movimentação'}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(transaction.created_at)}</Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: isPositive ? COLORS.SUCCESS : COLORS.ERROR },
          ]}
        >
          {isPositive ? '+' : '-'}{formatCurrency(transaction.valor)}
        </Text>
      </View>
    );
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.getParent()?.navigate('Login');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => navigation.getParent()?.navigate('Notifications')} 
            style={styles.notificationButton}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.TEXT_PRIMARY} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={18} color={COLORS.ERROR} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponível</Text>
        <Text style={styles.balanceValue}>
          {loading ? 'Carregando...' : formatCurrency(walletBalance)}
        </Text>
        <View style={styles.balanceActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => navigation.navigate('Invest')}
          >
            <Text style={styles.actionButtonTextPrimary}>Investir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => navigation.getParent()?.navigate('Withdraw')}
          >
            <Text style={styles.actionButtonTextSecondary}>Sacar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {poolStatus && (
        <View style={styles.poolCard}>
          <Text style={styles.poolTitle}>Status do pool</Text>
          <View style={styles.poolInfo}>
            <View style={styles.poolItem}>
              <Text style={styles.poolLabel}>Total</Text>
              <Text style={styles.poolValue}>{formatCurrency(poolStatus.saldo_total)}</Text>
            </View>
            <View style={styles.poolItem}>
              <Text style={styles.poolLabel}>Disponível</Text>
              <Text style={styles.poolValue}>{formatCurrency(poolStatus.saldo_disponivel)}</Text>
            </View>
            <View style={styles.poolItem}>
              <Text style={styles.poolLabel}>Utilização</Text>
              <Text style={styles.poolValue}>{poolStatus.percentual_utilizacao}%</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações rápidas</Text>
        <View style={styles.quickActions}>
          {quickActions.map(action => (
            <TouchableOpacity key={action.label} style={styles.quickActionCard} onPress={action.onPress}>
              <View style={styles.quickIconWrapper}>
                <MaterialCommunityIcons name={action.icon} size={26} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Movimentações recentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.viewAllLink}>Ver extrato</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.transactionCard}>
            <Text style={styles.emptyText}>
              Consulte o extrato para acompanhar cada transação realizada.
            </Text>
          </View>
        ) : (
          <View style={styles.transactionCard}>
            {recentTransactions.map(renderTransactionRow)}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_SCREEN,
  },
  scrollContent: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING['2XL'],
    paddingTop: SPACING.LG,
    rowGap: SPACING.LG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  userName: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: COMPONENTS.INPUT_RADIUS,
  },
  logoutText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
    marginLeft: SPACING.XS,
  },
  balanceCard: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.LG,
    borderRadius: COMPONENTS.CARD_RADIUS,
    ...COMPONENTS.CARD_SHADOW,
  },
  balanceLabel: {
    color: COLORS.PRIMARY_CONTRAST,
    fontSize: FONT_SIZES.SM,
    marginBottom: SPACING.SM,
  },
  balanceValue: {
    color: COLORS.PRIMARY_CONTRAST,
    fontSize: FONT_SIZES['4XL'],
    fontWeight: '600',
    marginBottom: SPACING.LG,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: SPACING.BASE,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.BASE,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.PRIMARY_CONTRAST,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonTextPrimary: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
    fontSize: FONT_SIZES.BODY,
  },
  actionButtonTextSecondary: {
    color: COLORS.PRIMARY_CONTRAST,
    fontWeight: '600',
    fontSize: FONT_SIZES.BODY,
  },
  poolCard: {
    backgroundColor: COLORS.BG_CARD,
    padding: SPACING.LG,
    borderRadius: COMPONENTS.CARD_RADIUS,
    ...COMPONENTS.CARD_SHADOW,
  },
  poolTitle: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.BASE,
  },
  poolInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poolItem: {
    flex: 1,
    alignItems: 'center',
  },
  poolLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  poolValue: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  section: {
    rowGap: SPACING.BASE,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.BASE,
  },
  quickActionCard: {
    flexBasis: '48%',
    backgroundColor: COLORS.BG_CARD,
    paddingVertical: SPACING.LG,
    borderRadius: COMPONENTS.CARD_RADIUS,
    alignItems: 'center',
    gap: SPACING.SM,
    ...COMPONENTS.CARD_SHADOW,
  },
  quickIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    backgroundColor: COLORS.BG_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    fontWeight: '500',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllLink: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
  },
  transactionCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.BASE,
    ...COMPONENTS.CARD_SHADOW,
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.BODY,
    textAlign: 'center',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  transactionIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.BG_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.BASE,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.BASE,
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.SM,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.ERROR,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.PRIMARY_CONTRAST,
  },
});