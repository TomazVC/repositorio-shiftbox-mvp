import { useEffect, useState } from 'react';
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
import { RootStackParamList } from '../types';
import { authService } from '../services/authService';
import { walletService } from '../services/walletService';
import { poolService } from '../services/poolService';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS, CURRENCY } from '../constants';

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

type Props = {
  navigation: DashboardScreenNavigationProp;
};

export default function Dashboard({ navigation }: Props) {
  const [userEmail, setUserEmail] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [poolStatus, setPoolStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  const loadUserData = async () => {
    const user = await authService.getCurrentUser();
    setUserEmail(user?.email || 'Usuário');
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Carregar saldo da carteira
      const wallet = await walletService.getWallet();
      setWalletBalance(wallet.saldo);

      // Carregar status do pool
      const pool = await poolService.getPoolStatus();
      setPoolStatus(pool);
    } catch (error) {
      console.warn('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Login');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const showComingSoon = () => {
    Alert.alert('Em Breve', 'Esta funcionalidade será implementada em breve!');
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.userName}>{userEmail}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Saldo da carteira */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Disponível</Text>
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
            onPress={showComingSoon}
          >
            <Text style={styles.actionButtonTextSecondary}>Sacar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status do pool */}
      {poolStatus && (
        <View style={styles.poolCard}>
          <Text style={styles.poolTitle}>Status do Pool</Text>
          <View style={styles.poolInfo}>
            <View style={styles.poolItem}>
              <Text style={styles.poolLabel}>Total no Pool</Text>
              <Text style={styles.poolValue}>{formatCurrency(poolStatus.saldo_total)}</Text>
            </View>
            <View style={styles.poolItem}>
              <Text style={styles.poolLabel}>Utilização</Text>
              <Text style={styles.poolValue}>{poolStatus.percentual_utilizacao}%</Text>
            </View>
            <View style={styles.poolItem}>
              <Text style={styles.poolLabel}>Investidores</Text>
              <Text style={styles.poolValue}>{poolStatus.total_investidores}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Ações rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => navigation.navigate('LoanRequest')}
          >
            <Text style={styles.quickActionIcon}>🏦</Text>
            <Text style={styles.quickActionText}>Pedir Empréstimo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={showComingSoon}
          >
            <Text style={styles.quickActionIcon}>💰</Text>
            <Text style={styles.quickActionText}>Meus Investimentos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={showComingSoon}
          >
            <Text style={styles.quickActionIcon}>📈</Text>
            <Text style={styles.quickActionText}>Rendimentos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => navigation.navigate('Transactions')}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Extrato</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transações recentes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transações Recentes</Text>
        <View style={styles.transactionCard}>
          <Text style={styles.emptyText}>
            Nenhuma transação ainda
          </Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Transactions')}
          >
            <Text style={styles.viewAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_SCREEN,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.LG,
    paddingTop: 60,
    backgroundColor: COLORS.BG_CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
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
    padding: SPACING.SM,
  },
  logoutText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
  },
  balanceCard: {
    backgroundColor: COLORS.PRIMARY,
    margin: SPACING.LG,
    padding: SPACING.LG,
    borderRadius: COMPONENTS.CARD_RADIUS,
    ...COMPONENTS.CARD_SHADOW,
  },
  balanceLabel: {
    color: COLORS.PRIMARY_CONTRAST,
    fontSize: FONT_SIZES.SM,
    marginBottom: SPACING.SM,
    opacity: 0.9,
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
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.BASE,
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
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.BASE,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.BASE-1,
  },
  quickActionCard: {
    backgroundColor: COLORS.BG_CARD,
    width: '48%',
    padding: SPACING.LG,
    borderRadius: COMPONENTS.CARD_RADIUS,
    alignItems: 'center',
    ...COMPONENTS.CARD_SHADOW,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: SPACING.SM,
  },
  quickActionText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    fontWeight: '500',
  },
  transactionCard: {
    backgroundColor: COLORS.BG_CARD,
    padding: SPACING.LG,
    borderRadius: COMPONENTS.CARD_RADIUS,
    alignItems: 'center',
    ...COMPONENTS.CARD_SHADOW,
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.BODY,
    marginBottom: SPACING.BASE,
  },
  viewAllButton: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.BASE,
  },
  viewAllText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
  },
});