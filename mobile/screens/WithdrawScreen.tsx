import { useEffect, useMemo, useRef, useState } from 'react';
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
import { RootStackParamList, Loan } from '../types';
import { authService } from '../services/authService';
import { walletService } from '../services/walletService';
import { loanService } from '../services/loanService';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS, CURRENCY } from '../constants';

type WithdrawScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Withdraw'
>;

type Props = {
  navigation: WithdrawScreenNavigationProp;
};

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
};

export default function WithdrawScreen({ navigation }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletId, setWalletId] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loans, setLoans] = useState<Loan[]>([]);
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

      const wallet = await walletService.getWalletByUser(user.id);
      setWalletId(wallet.id);
      setWalletBalance(wallet.saldo);

      const userLoans = await loanService.getLoans({ userId: user.id });
      setLoans(userLoans);
    } catch (error: any) {
      console.warn('Erro ao carregar dados de saque:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar os dados.');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const outstandingLoanAmount = useMemo(() => {
    return loans
      .filter((loan) => ['pendente', 'ativo'].includes(loan.status))
      .reduce((total, loan) => {
        const totalWithInterest = loan.valor * (1 + (loan.taxa_juros ?? 0));
        const remaining = totalWithInterest - loan.valor_pago;
        return total + Math.max(remaining, 0);
      }, 0);
  }, [loans]);

  const projectedBalance = useMemo(() => {
    const value = Number.parseFloat(amount.replace(',', '.'));
    if (Number.isNaN(value)) {
      return walletBalance;
    }
    return walletBalance - value;
  }, [amount, walletBalance]);

  const suggestedWithdrawals = useMemo(() => {
    if (walletBalance <= 0) {
      return [] as number[];
    }
    const raw = [0.25, 0.5, 1].map((ratio) => parseFloat((walletBalance * ratio).toFixed(2)));
    const unique = Array.from(new Set(raw)).filter((value) => value > 0);
    return unique;
  }, [walletBalance]);

  const handleWithdraw = async () => {
    const withdrawAmount = Number.parseFloat(amount.replace(',', '.'));
    setFeedback(null);

    if (!amount || Number.isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setFeedback({ type: 'error', message: 'Informe um valor válido para sacar.' });
      return;
    }

    if (!walletId) {
      setFeedback({ type: 'error', message: 'Carteira não localizada.' });
      return;
    }

    if (withdrawAmount > walletBalance) {
      setFeedback({ type: 'error', message: 'Saldo insuficiente para o saque solicitado.' });
      return;
    }

    setLoading(true);
    try {
      await walletService.withdraw({ walletId, amount: withdrawAmount });
      await loadContext();
      setAmount('');
      setFeedback({
        type: 'success',
        message: `Saque de ${formatCurrency(withdrawAmount)} solicitado. O valor será transferido para sua conta cadastrada.`,
      });

      redirectTimeoutRef.current = setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 1200);
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error.message || 'Não foi possível concluir o saque.',
      });
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Solicitar saque</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balanceValue}>{formatCurrency(walletBalance)}</Text>
            {amount ? (
              <Text style={styles.projectedLabel}>
                Saldo após saque: {formatCurrency(projectedBalance)}
              </Text>
            ) : null}
          </View>

          {outstandingLoanAmount > 0 && (
            <View style={styles.loanAlert}>
              <MaterialCommunityIcons name="shield-alert" size={20} color={COLORS.WARNING} />
              <View style={{ flex: 1 }}>
                <Text style={styles.loanAlertTitle}>Empréstimos ativos</Text>
                <Text style={styles.loanAlertText}>
                  Você possui {formatCurrency(outstandingLoanAmount)} em empréstimos pendentes. Garanta saldo para as próximas parcelas antes de sacar.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.formTitle}>Quanto deseja sacar?</Text>

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

            {suggestedWithdrawals.length > 0 && (
              <View style={styles.suggestedContainer}>
                <Text style={styles.suggestedLabel}>Sugestões com base no seu saldo</Text>
                <View style={styles.suggestedButtonsRow}>
                  {suggestedWithdrawals.map((value) => (
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
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleWithdraw}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Processando...' : 'Confirmar saque'}</Text>
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
  balanceCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    gap: SPACING.SM,
    ...COMPONENTS.CARD_SHADOW,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  balanceValue: {
    fontSize: FONT_SIZES['3XL'],
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  projectedLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  loanAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.SM,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: COMPONENTS.INPUT_RADIUS,
    padding: SPACING.BASE,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  loanAlertTitle: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  loanAlertText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
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
