import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Transaction } from '../types';
import { walletService } from '../services/walletService';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS, CURRENCY, TRANSACTION_TYPES } from '../constants';

type TransactionsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Transactions'
>;

type Props = {
  navigation: TransactionsScreenNavigationProp;
};

export default function TransactionsScreen({ navigation }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await walletService.getTransactions();
      setTransactions(data);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case TRANSACTION_TYPES.DEPOSIT:
        return '📥';
      case TRANSACTION_TYPES.WITHDRAW:
        return '📤';
      case TRANSACTION_TYPES.INVESTMENT:
        return '💰';
      case TRANSACTION_TYPES.LOAN:
        return '🏦';
      case TRANSACTION_TYPES.RETURN:
        return '💸';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case TRANSACTION_TYPES.DEPOSIT:
      case TRANSACTION_TYPES.RETURN:
        return COLORS.SUCCESS;
      case TRANSACTION_TYPES.WITHDRAW:
      case TRANSACTION_TYPES.INVESTMENT:
      case TRANSACTION_TYPES.LOAN:
        return COLORS.ERROR;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case TRANSACTION_TYPES.DEPOSIT:
        return 'Depósito';
      case TRANSACTION_TYPES.WITHDRAW:
        return 'Saque';
      case TRANSACTION_TYPES.INVESTMENT:
        return 'Investimento';
      case TRANSACTION_TYPES.LOAN:
        return 'Empréstimo';
      case TRANSACTION_TYPES.RETURN:
        return 'Retorno';
      default:
        return 'Transação';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return COLORS.SUCCESS;
      case 'pending':
        return COLORS.WARNING;
      case 'failed':
        return COLORS.ERROR;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const renderTransaction = (transaction: Transaction) => (
    <View key={transaction.id} style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIconContainer}>
          <Text style={styles.transactionIcon}>
            {getTransactionIcon(transaction.type)}
          </Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>
            {getTransactionLabel(transaction.type)}
          </Text>
          <Text style={styles.transactionDescription}>
            {transaction.description}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.created_at)}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.transactionValue,
              { color: getTransactionColor(transaction.type) },
            ]}
          >
            {transaction.type === TRANSACTION_TYPES.DEPOSIT || 
             transaction.type === TRANSACTION_TYPES.RETURN ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(transaction.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) },
              ]}
            >
              {getStatusLabel(transaction.status)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transações</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando transações...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Nenhuma transação</Text>
              <Text style={styles.emptyDescription}>
                Suas transações aparecerão aqui quando você fizer investimentos ou empréstimos.
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map(renderTransaction)}
            </View>
          )}
        </View>
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
    padding: SPACING.LG,
    paddingTop: 60,
    backgroundColor: COLORS.BG_CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  backButton: {
    marginRight: SPACING.BASE,
  },
  backButtonText: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  title: {
    fontSize: FONT_SIZES.SUBTITLE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.LG,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['2XL'],
  },
  loadingText: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['2XL'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.BASE,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  transactionsList: {
    gap: SPACING.SM,
  },
  transactionCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.BASE,
    ...COMPONENTS.CARD_SHADOW,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BG_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.BASE,
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '500',
  },
});
