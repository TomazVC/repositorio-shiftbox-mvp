import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, PoolStatus } from '../types';
import { loanService } from '../services/loanService';
import { poolService } from '../services/poolService';
import { authService } from '../services/authService';
import { walletService } from '../services/walletService';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS, CURRENCY } from '../constants';

type LoanRequestScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoanRequest'
>;

type Props = {
  navigation: LoanRequestScreenNavigationProp;
};

export default function LoanRequestScreen({ navigation }: Props) {
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('12');
  const [loading, setLoading] = useState(false);
  const [poolStatus, setPoolStatus] = useState<PoolStatus | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadContext();
  }, []);

  const loadContext = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user?.id) {
        throw new Error('Não foi possível identificar o usuário.');
      }
      setUserId(user.id);

      const pool = await poolService.getPoolStatus();
      setPoolStatus(pool);
    } catch (error: any) {
      console.warn('Erro ao carregar dados do empréstimo:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar os dados.');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const handleLoanRequest = async () => {
    const loanAmount = Number.parseFloat(amount.replace(',', '.'));
    const installmentCount = Number.parseInt(installments, 10);

    if (!amount || Number.isNaN(loanAmount) || loanAmount <= 0) {
      Alert.alert('Erro', 'Informe um valor válido.');
      return;
    }

    if (loanAmount < CURRENCY.MIN_LOAN) {
      Alert.alert('Erro', `Valor mínimo: ${formatCurrency(CURRENCY.MIN_LOAN)}.`);
      return;
    }

    if (loanAmount > CURRENCY.MAX_LOAN) {
      Alert.alert('Erro', `Valor máximo: ${formatCurrency(CURRENCY.MAX_LOAN)}.`);
      return;
    }

    if (Number.isNaN(installmentCount) || installmentCount < 6 || installmentCount > 60) {
      Alert.alert('Erro', 'Escolha entre 6 e 60 parcelas.');
      return;
    }

    if (poolStatus && loanAmount > poolStatus.saldo_disponivel) {
      Alert.alert('Erro', 'Valor acima do saldo disponível no pool.');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Não foi possível identificar o usuário.');
      return;
    }

    setLoading(true);
    try {
      const loan = await loanService.requestLoan({
        userId,
        amount: loanAmount,
        installments: installmentCount,
      });

      const approved = await loanService.approveLoan(loan.id);

      // Recarrega contexto para refletir o novo saldo
      const wallet = await walletService.getWalletByUser(userId);
      setPoolStatus(await poolService.getPoolStatus());

      Alert.alert(
        'Sucesso',
        `Empréstimo de ${formatCurrency(approved.valor)} aprovado automaticamente. Seu novo saldo é ${formatCurrency(wallet.saldo)}.`,
        [{
          text: 'Ir para dashboard',
          onPress: () => navigation.navigate('Dashboard'),
        }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível registrar o pedido.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedAmounts = [1000, 5000, 10000, 25000];
  const installmentOptions = [6, 12, 24, 36, 48, 60];

  const monthlyPayment = amount && installments
    ? Number.parseFloat(amount) / Number.parseInt(installments, 10)
    : 0;

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.PRIMARY} />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Solicitar empréstimo</Text>
        </View>

        <View style={styles.content}>
          {poolStatus && (
            <View style={styles.poolCard}>
              <Text style={styles.poolTitle}>Pool em tempo real</Text>
              <View style={styles.poolInfo}>
                <View style={styles.poolItem}>
                  <Text style={styles.poolLabel}>Disponível</Text>
                  <Text style={styles.poolValue}>{formatCurrency(poolStatus.saldo_disponivel)}</Text>
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

          <View style={styles.form}>
            <Text style={styles.formTitle}>Valor solicitado</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>{CURRENCY.SYMBOL}</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                placeholderTextColor={COLORS.PLACEHOLDER}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.suggestedContainer}>
              <Text style={styles.suggestedLabel}>Sugestões rápidas</Text>
              <View style={styles.suggestedButtonsRow}>
                {suggestedAmounts.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.suggestedButton}
                    onPress={() => setAmount(String(value))}
                  >
                    <Text style={styles.suggestedButtonText}>{formatCurrency(value)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.label}>Parcelas</Text>
            <View style={styles.installmentButtonsRow}>
              {installmentOptions.map((option) => {
                const isActive = installments === String(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.installmentButton, isActive && styles.installmentButtonActive]}
                    onPress={() => setInstallments(String(option))}
                  >
                    <Text
                      style={[
                        styles.installmentButtonText,
                        isActive && styles.installmentButtonTextActive,
                      ]}
                    >
                      {option}x
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumo</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Valor solicitado</Text>
                <Text style={styles.summaryValue}>{amount ? formatCurrency(Number(amount)) : '-'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Parcelas</Text>
                <Text style={styles.summaryValue}>{installments}x</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimativa parcela</Text>
                <Text style={styles.summaryValue}>
                  {monthlyPayment ? formatCurrency(monthlyPayment) : '-'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLoanRequest}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Solicitar empréstimo'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.BG_SCREEN,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['2XL'],
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
  content: {
    padding: SPACING.LG,
    gap: SPACING.LG,
  },
  poolCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
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
  form: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    gap: SPACING.BASE,
    ...COMPONENTS.CARD_SHADOW,
  },
  formTitle: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    backgroundColor: COLORS.BG_SCREEN,
  },
  currencySymbol: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: SPACING.BASE,
  },
  amountInput: {
    flex: 1,
    height: COMPONENTS.INPUT_HEIGHT,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: SPACING.BASE,
  },
  suggestedContainer: {
    marginTop: SPACING.BASE,
  },
  suggestedLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  suggestedButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestedButton: {
    backgroundColor: COLORS.BG_MUTED,
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.SM,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    marginRight: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  suggestedButtonText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  label: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  installmentButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  installmentButton: {
    backgroundColor: COLORS.BG_MUTED,
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.SM,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    minWidth: 56,
    alignItems: 'center',
    marginRight: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  installmentButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  installmentButtonText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  installmentButtonTextActive: {
    color: COLORS.PRIMARY_CONTRAST,
  },
  summaryCard: {
    backgroundColor: COLORS.BG_MUTED,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    padding: SPACING.BASE,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.XS,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  summaryValue: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: COMPONENTS.BUTTON_RADIUS,
    height: COMPONENTS.BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.PRIMARY_CONTRAST,
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
  },
});