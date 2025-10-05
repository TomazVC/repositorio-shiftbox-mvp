import { useState, useEffect, useMemo, useRef } from 'react';
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

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
};

type LoanSummary = {
  valid: boolean;
  amount: number;
  installmentCount: number;
  monthlyPayment: number;
  totalInterest: number;
  platformFee: number;
  reserveContribution: number;
  totalWithFees: number;
};

const INTEREST_RATE = 0.15; // 15% ao ano
const PLATFORM_FEE_RATE = 0.02; // 2% taxa da plataforma
const RESERVE_FEE_RATE = 0.01; // 1% para fundo de segurança

const initialSummary: LoanSummary = {
  valid: false,
  amount: 0,
  installmentCount: 0,
  monthlyPayment: 0,
  totalInterest: 0,
  platformFee: 0,
  reserveContribution: 0,
  totalWithFees: 0,
};

export default function LoanRequestScreen({ navigation }: Props) {
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('12');
  const [loading, setLoading] = useState(false);
  const [poolStatus, setPoolStatus] = useState<PoolStatus | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadContext();
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
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

  const loanSummary = useMemo<LoanSummary>(() => {
    const loanAmount = Number.parseFloat(amount.replace(',', '.'));
    const installmentCount = Number.parseInt(installments, 10);

    if (
      Number.isNaN(loanAmount) ||
      loanAmount <= 0 ||
      Number.isNaN(installmentCount) ||
      installmentCount <= 0
    ) {
      return initialSummary;
    }

    const monthlyRate = INTEREST_RATE / 12;
    const factor = Math.pow(1 + monthlyRate, installmentCount);
    const monthlyPayment =
      monthlyRate === 0
        ? loanAmount / installmentCount
        : loanAmount * ((monthlyRate * factor) / (factor - 1));

    const totalInterest = monthlyPayment * installmentCount - loanAmount;
    const platformFee = loanAmount * PLATFORM_FEE_RATE;
    const reserveContribution = loanAmount * RESERVE_FEE_RATE;
    const totalWithFees = loanAmount + totalInterest + platformFee + reserveContribution;

    return {
      valid: true,
      amount: loanAmount,
      installmentCount,
      monthlyPayment,
      totalInterest,
      platformFee,
      reserveContribution,
      totalWithFees,
    };
  }, [amount, installments]);

  const handleLoanRequest = async () => {
    const loanAmount = Number.parseFloat(amount.replace(',', '.'));
    const installmentCount = Number.parseInt(installments, 10);
    setFeedback(null);

    if (!amount || Number.isNaN(loanAmount) || loanAmount <= 0) {
      setFeedback({ type: 'error', message: 'Informe um valor válido.' });
      return;
    }

    if (loanAmount < CURRENCY.MIN_LOAN) {
      setFeedback({
        type: 'error',
        message: `Valor mínimo: ${formatCurrency(CURRENCY.MIN_LOAN)}.`,
      });
      return;
    }

    if (loanAmount > CURRENCY.MAX_LOAN) {
      setFeedback({
        type: 'error',
        message: `Valor máximo: ${formatCurrency(CURRENCY.MAX_LOAN)}.`,
      });
      return;
    }

    if (Number.isNaN(installmentCount) || installmentCount < 6 || installmentCount > 60) {
      setFeedback({ type: 'error', message: 'Escolha entre 6 e 60 parcelas.' });
      return;
    }

    if (poolStatus && loanAmount > poolStatus.saldo_disponivel) {
      setFeedback({ type: 'error', message: 'Valor acima do saldo disponível no pool.' });
      return;
    }

    if (!userId) {
      setFeedback({ type: 'error', message: 'Não foi possível identificar o usuário.' });
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
      const wallet = await walletService.getWalletByUser(userId);
      setPoolStatus(await poolService.getPoolStatus());

      const snapshot = loanSummary.valid ? loanSummary : { ...initialSummary, amount: loanAmount, installmentCount };

      setFeedback({
        type: 'success',
        message: `Empréstimo de ${formatCurrency(approved.valor)} aprovado. Parcela estimada de ${formatCurrency(
          snapshot.monthlyPayment || approved.valor / installmentCount
        )}. Saldo disponível atualizado: ${formatCurrency(wallet.saldo)}.`,
      });

      redirectTimeoutRef.current = setTimeout(() => {
        setAmount('');
        navigation.navigate('Dashboard');
      }, 1500);
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error.message || 'Não foi possível registrar o pedido.',
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedAmounts = [1000, 5000, 10000, 25000];
  const installmentOptions = [6, 12, 24, 36, 48, 60];

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
              <Text style={styles.poolTitle}>Disponibilidade do pool</Text>
              <View style={styles.poolInfo}>
                <View style={styles.poolItem}>
                  <Text style={styles.poolLabel}>Disponível</Text>
                  <Text style={styles.poolValue}>{formatCurrency(poolStatus.saldo_disponivel)}</Text>
                </View>
                <View style={styles.poolItem}>
                  <Text style={styles.poolLabel}>Total comprometido</Text>
                  <Text style={styles.poolValue}>{formatCurrency(poolStatus.saldo_total - poolStatus.saldo_disponivel)}</Text>
                </View>
                <View style={styles.poolItem}>
                  <Text style={styles.poolLabel}>Utilização</Text>
                  <Text style={styles.poolValue}>{poolStatus.percentual_utilizacao.toFixed(1)}%</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.formTitle}>Preencha os dados do empréstimo</Text>

            {feedback && (
              <View
                style={[
                  styles.feedbackContainer,
                  feedback.type === 'success'
                    ? styles.feedbackSuccess
                    : styles.feedbackError,
                ]}
              >
                <MaterialCommunityIcons
                  name={feedback.type === 'success' ? 'check-circle' : 'alert-circle'}
                  size={20}
                  color={COLORS.PRIMARY_CONTRAST}
                />
                <Text style={styles.feedbackText}>{feedback.message}</Text>
              </View>
            )}

            <View>
              <Text style={styles.label}>Valor desejado</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>{CURRENCY.SYMBOL}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0,00"
                  placeholderTextColor={COLORS.PLACEHOLDER}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
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
                      <Text style={styles.suggestedButtonText}>
                        {formatCurrency(value).replace(/\u00a0/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.label}>Parcelas</Text>
              <View style={styles.installmentButtonsRow}>
                {installmentOptions.map((option) => {
                  const isActive = installments === option.toString();
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.installmentButton,
                        isActive && styles.installmentButtonActive,
                      ]}
                      onPress={() => setInstallments(option.toString())}
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
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Simulação detalhada</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Valor solicitado</Text>
                <Text style={styles.summaryValue}>
                  {loanSummary.valid ? formatCurrency(loanSummary.amount) : '-'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Juros estimados (15% a.a.)</Text>
                <Text style={styles.summaryValue}>
                  {loanSummary.valid ? formatCurrency(loanSummary.totalInterest) : '-'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxa da plataforma (2%)</Text>
                <Text style={styles.summaryValue}>
                  {loanSummary.valid ? formatCurrency(loanSummary.platformFee) : '-'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Reserva de segurança (1%)</Text>
                <Text style={styles.summaryValue}>
                  {loanSummary.valid ? formatCurrency(loanSummary.reserveContribution) : '-'}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total a devolver</Text>
                <Text style={styles.summaryValue}>
                  {loanSummary.valid ? formatCurrency(loanSummary.totalWithFees) : '-'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Parcela estimada</Text>
                <Text style={styles.summaryValue}>
                  {loanSummary.valid ? formatCurrency(loanSummary.monthlyPayment) : '-'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLoanRequest}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Processando...' : 'Solicitar empréstimo agora'}
              </Text>
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
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    padding: SPACING.SM,
    borderRadius: COMPONENTS.INPUT_RADIUS,
  },
  feedbackSuccess: {
    backgroundColor: COLORS.SUCCESS,
  },
  feedbackError: {
    backgroundColor: COLORS.ERROR,
  },
  feedbackText: {
    color: COLORS.PRIMARY_CONTRAST,
    fontSize: FONT_SIZES.SM,
    flex: 1,
    fontWeight: '500',
  },
  label: {
    fontSize: FONT_SIZES.SM,
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
    gap: SPACING.XS,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.DIVIDER,
    marginVertical: SPACING.XS,
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
