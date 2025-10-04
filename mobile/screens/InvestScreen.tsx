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
import { walletService } from '../services/walletService';
import { poolService } from '../services/poolService';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS, CURRENCY } from '../constants';

type InvestScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Invest'
>;

type Props = {
  navigation: InvestScreenNavigationProp;
};

export default function InvestScreen({ navigation }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [poolStatus, setPoolStatus] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar saldo da carteira
      const wallet = await walletService.getWallet();
      setWalletBalance(wallet.saldo);

      // Carregar status do pool
      const pool = await poolService.getPoolStatus();
      setPoolStatus(pool);
    } catch (error) {
      console.warn('Erro ao carregar dados:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleInvest = async () => {
    const investAmount = parseFloat(amount);

    if (!amount || investAmount <= 0) {
      Alert.alert('Erro', 'Digite um valor válido');
      return;
    }

    if (investAmount < CURRENCY.MIN_INVESTMENT) {
      Alert.alert('Erro', `Valor mínimo para investimento: ${formatCurrency(CURRENCY.MIN_INVESTMENT)}`);
      return;
    }

    if (investAmount > CURRENCY.MAX_INVESTMENT) {
      Alert.alert('Erro', `Valor máximo para investimento: ${formatCurrency(CURRENCY.MAX_INVESTMENT)}`);
      return;
    }

    if (investAmount > walletBalance) {
      Alert.alert('Erro', 'Saldo insuficiente');
      return;
    }

    setLoading(true);
    try {
      await walletService.invest({
        amount: investAmount,
        description: description || 'Investimento no pool',
      });

      Alert.alert(
        'Sucesso',
        `Investimento de ${formatCurrency(investAmount)} realizado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao realizar investimento');
    } finally {
      setLoading(false);
    }
  };

  const suggestedAmounts = [100, 500, 1000, 5000];

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
          <Text style={styles.title}>Investir no Pool</Text>
        </View>

        <View style={styles.content}>
          {/* Saldo disponível */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Disponível</Text>
            <Text style={styles.balanceValue}>{formatCurrency(walletBalance)}</Text>
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
              </View>
            </View>
          )}

          {/* Formulário de investimento */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Valor do Investimento</Text>
            
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

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Investimento para diversificação"
              placeholderTextColor={COLORS.PLACEHOLDER}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleInvest}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Investindo...' : 'Investir'}
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
  balanceCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    marginBottom: SPACING.BASE,
    ...COMPONENTS.CARD_SHADOW,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  balanceValue: {
    fontSize: FONT_SIZES['3XL'],
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  poolCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    marginBottom: SPACING.BASE,
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
    paddingHorizontal: SPACING.BASE,
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
