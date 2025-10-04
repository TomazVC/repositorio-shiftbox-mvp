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
import { RootStackParamList } from '../types';
import { loanService } from '../services/loanService';
import { poolService } from '../services/poolService';
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
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [poolStatus, setPoolStatus] = useState<any>(null);

  useEffect(() => {
    loadPoolStatus();
  }, []);

  const loadPoolStatus = async () => {
    try {
      const pool = await poolService.getPoolStatus();
      setPoolStatus(pool);
    } catch (error) {
      console.warn('Erro ao carregar status do pool:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleLoanRequest = async () => {
    const loanAmount = parseFloat(amount);
    const installmentCount = parseInt(installments);

    if (!amount || loanAmount <= 0) {
      Alert.alert('Erro', 'Digite um valor válido');
      return;
    }

    if (loanAmount < CURRENCY.MIN_LOAN) {
      Alert.alert('Erro', `Valor mínimo para empréstimo: ${formatCurrency(CURRENCY.MIN_LOAN)}`);
      return;
    }

    if (loanAmount > CURRENCY.MAX_LOAN) {
      Alert.alert('Erro', `Valor máximo para empréstimo: ${formatCurrency(CURRENCY.MAX_LOAN)}`);
      return;
    }

    if (installmentCount < 6 || installmentCount > 60) {
      Alert.alert('Erro', 'Número de parcelas deve estar entre 6 e 60');
      return;
    }

    // Verificar se o pool tem saldo disponível
    if (poolStatus && loanAmount > poolStatus.saldo_disponivel) {
      Alert.alert('Erro', 'Valor solicitado excede o saldo disponível no pool');
      return;
    }

    setLoading(true);
    try {
      await loanService.requestLoan({
        amount: loanAmount,
        installments: installmentCount,
        purpose: purpose || 'Empréstimo pessoal',
      });

      Alert.alert(
        'Sucesso',
        `Solicitação de empréstimo de ${formatCurrency(loanAmount)} enviada! Você receberá uma resposta em breve.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao solicitar empréstimo');
    } finally {
      setLoading(false);
    }
  };

  const suggestedAmounts = [1000, 5000, 10000, 25000];
  const installmentOptions = [6, 12, 24, 36, 48, 60];

  const monthlyPayment = amount && installments 
    ? parseFloat(amount) / parseInt(installments)
    : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Solicitar Empréstimo</Text>
        </View>

        <View style={styles.content}>
          {/* Status do pool */}
          {poolStatus && (
            <View style={styles.poolCard}>
              <Text style={styles.poolTitle}>Disponível no Pool</Text>
              <Text style={styles.poolValue}>{formatCurrency(poolStatus.saldo_disponivel)}</Text>
              <Text style={styles.poolSubtitle}>
                Utilização: {poolStatus.percentual_utilizacao}%
              </Text>
            </View>
          )}

          {/* Formulário de empréstimo */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Valor do Empréstimo</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0,00"
                placeholderTextColor={COLORS.PLACEHOLDER}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {/* Valores sugeridos */}
            <View style={styles.suggestedContainer}>
              <Text style={styles.suggestedLabel}>Valores sugeridos:</Text>
              <View style={styles.suggestedButtons}>
                {suggestedAmounts.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.suggestedButton}
                    onPress={() => setAmount(value.toString())}
                  >
                    <Text style={styles.suggestedButtonText}>
                      {formatCurrency(value)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.label}>Número de Parcelas</Text>
            <View style={styles.installmentButtons}>
              {installmentOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.installmentButton,
                    installments === option.toString() && styles.installmentButtonActive
                  ]}
                  onPress={() => setInstallments(option.toString())}
                >
                  <Text style={[
                    styles.installmentButtonText,
                    installments === option.toString() && styles.installmentButtonTextActive
                  ]}>
                    {option}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Finalidade do Empréstimo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Reforma da casa, investimento, emergência"
              placeholderTextColor={COLORS.PLACEHOLDER}
              value={purpose}
              onChangeText={setPurpose}
              multiline
              numberOfLines={3}
            />

            {/* Resumo do empréstimo */}
            {amount && installments && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Resumo do Empréstimo</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Valor solicitado:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(parseFloat(amount))}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Parcelas:</Text>
                  <Text style={styles.summaryValue}>{installments}x</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Valor da parcela:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(monthlyPayment)}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLoanRequest}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Enviando...' : 'Solicitar Empréstimo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_SCREEN,
  },
  scrollView: {
    flex: 1,
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
  content: {
    padding: SPACING.LG,
  },
  poolCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    marginBottom: SPACING.BASE,
    ...COMPONENTS.CARD_SHADOW,
    alignItems: 'center',
  },
  poolTitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  poolValue: {
    fontSize: FONT_SIZES['3XL'],
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.XS,
  },
  poolSubtitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  form: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    ...COMPONENTS.CARD_SHADOW,
  },
  formTitle: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.BASE,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    marginBottom: SPACING.BASE,
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
  },
  suggestedContainer: {
    marginBottom: SPACING.BASE,
  },
  suggestedLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  suggestedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  suggestedButton: {
    backgroundColor: COLORS.BG_MUTED,
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.SM,
    borderRadius: COMPONENTS.INPUT_RADIUS,
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
    marginBottom: SPACING.SM,
    marginTop: SPACING.BASE,
  },
  installmentButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
    marginBottom: SPACING.BASE,
  },
  installmentButton: {
    backgroundColor: COLORS.BG_MUTED,
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.SM,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    minWidth: 50,
    alignItems: 'center',
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
  input: {
    height: 80,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.BASE,
    fontSize: FONT_SIZES.BODY,
    marginBottom: SPACING.LG,
    color: COLORS.TEXT_PRIMARY,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: COLORS.BG_MUTED,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    padding: SPACING.BASE,
    marginBottom: SPACING.LG,
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
