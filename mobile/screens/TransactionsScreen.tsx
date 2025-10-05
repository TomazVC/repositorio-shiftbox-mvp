import { useEffect, useMemo, useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, Transaction } from '../types';
import { walletService } from '../services/walletService';
import { authService } from '../services/authService';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS, CURRENCY, TRANSACTION_TYPES } from '../constants';

type TransactionsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Transactions'
>;

type Props = {
  navigation: TransactionsScreenNavigationProp;
};

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

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
      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('Não foi possível identificar o usuário logado.');
      }

      const wallet = await walletService.getWalletByUser(currentUser.id);
      const data = await walletService.getTransactions({ walletId: wallet.id });
      setTransactions(data);
    } catch (error: any) {
      console.warn('Erro ao carregar transações:', error);
      Alert.alert('Erro', error.message || 'Erro ao carregar transações.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

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

  const iconNames = useMemo<Record<string, MaterialIconName>>(
    () => ({
      [TRANSACTION_TYPES.DEPOSITO]: 'arrow-down-bold-circle',
      [TRANSACTION_TYPES.SAQUE]: 'arrow-up-bold-circle',
      [TRANSACTION_TYPES.INVESTIMENTO]: 'finance',
      [TRANSACTION_TYPES.EMPRESTIMO_RECEBIDO]: 'bank',
      [TRANSACTION_TYPES.PAGAMENTO_EMPRESTIMO]: 'cash-minus',
      [TRANSACTION_TYPES.RENDIMENTO]: 'trending-up',
      [TRANSACTION_TYPES.RESGATE_INVESTIMENTO]: 'cash-refund',
      [TRANSACTION_TYPES.AJUSTE_SALDO]: 'tune-variant',
      [TRANSACTION_TYPES.CANCELAMENTO_INVESTIMENTO]: 'cancel',
    }),
    []
  );

  const positiveTypes = useMemo(
    () =>
      new Set<string>([
        TRANSACTION_TYPES.DEPOSITO,
        TRANSACTION_TYPES.EMPRESTIMO_RECEBIDO,
        TRANSACTION_TYPES.RENDIMENTO,
        TRANSACTION_TYPES.RESGATE_INVESTIMENTO,
        TRANSACTION_TYPES.AJUSTE_SALDO,
      ]),
    []
  );

  const iconFallback: MaterialIconName = 'swap-horizontal';

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case TRANSACTION_TYPES.DEPOSITO:
        return 'Depósito';
      case TRANSACTION_TYPES.SAQUE:
        return 'Saque';
      case TRANSACTION_TYPES.INVESTIMENTO:
        return 'Investimento';
      case TRANSACTION_TYPES.EMPRESTIMO_RECEBIDO:
        return 'Empréstimo recebido';
      case TRANSACTION_TYPES.PAGAMENTO_EMPRESTIMO:
        return 'Pagamento de empréstimo';
      case TRANSACTION_TYPES.RENDIMENTO:
        return 'Rendimento';
      case TRANSACTION_TYPES.RESGATE_INVESTIMENTO:
        return 'Resgate de investimento';
      case TRANSACTION_TYPES.AJUSTE_SALDO:
        return 'Ajuste de saldo';
      case TRANSACTION_TYPES.CANCELAMENTO_INVESTIMENTO:
        return 'Cancelamento de investimento';
      default:
        return 'Transação';
    }
  };

  const getTransactionColor = (type: string) =>
    positiveTypes.has(type) ? COLORS.SUCCESS : COLORS.ERROR;

  const renderTransaction = (transaction: Transaction) => {
    const iconName = iconNames[transaction.tipo] ?? iconFallback;
    const label = getTransactionLabel(transaction.tipo);
    const color = getTransactionColor(transaction.tipo);
    const isPositive = positiveTypes.has(transaction.tipo);

    return (
      <View key={transaction.id} style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIconContainer}>
            <MaterialCommunityIcons name={iconName} size={24} color={color} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>{label}</Text>
            {!!transaction.descricao && (
              <Text style={styles.transactionDescription}>{transaction.descricao}</Text>
            )}
            <Text style={styles.transactionDate}>{formatDate(transaction.created_at)}</Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[styles.transactionValue, { color }]}>
              {isPositive ? '+' : '-'}
              {formatCurrency(transaction.valor)}
            </Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Efetuada</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const hasTransactions = transactions.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.PRIMARY} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Extrato</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando transações...</Text>
            </View>
          ) : hasTransactions ? (
            <View style={styles.transactionsList}>{transactions.map(renderTransaction)}</View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={40} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.emptyTitle}>Nenhuma transação por aqui</Text>
              <Text style={styles.emptyDescription}>
                Assim que você começar a investir ou solicitar empréstimos, o histórico aparece nesta tela.
              </Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingTop: 60,
    paddingBottom: SPACING.SM,
    backgroundColor: COLORS.BG_CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: SPACING.XS,
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
  scrollContent: {
    paddingBottom: SPACING['2XL'],
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
    gap: SPACING.SM,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
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
    paddingHorizontal: SPACING.SM,
    paddingVertical: 4,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    backgroundColor: COLORS.BG_MUTED,
  },
  statusText: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
  },
});