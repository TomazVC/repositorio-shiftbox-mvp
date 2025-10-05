import { useEffect, useState } from 'react';
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
import { authService } from '../services/authService';
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
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
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

      const wallet = await walletService.getWalletByUser(user.id);
      setWalletBalance(wallet.saldo);

      const pool = await poolService.getPoolStatus();
      setPoolStatus(pool);
    } catch (error: any) {
      console.warn('Erro ao carregar contexto de investimento:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar os dados.');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const handleInvest = async () => {
    const investAmount = Number.parseFloat(amount.replace(',', '.'));

    if (!amount || Number.isNaN(investAmount) || investAmount <= 0) {
      Alert.alert('Erro', 'Informe um valor válido para investir.');
      return;
    }

    if (investAmount < CURRENCY.MIN_INVESTMENT) {
      Alert.alert('Erro', `Valor mínimo: ${formatCurrency(CURRENCY.MIN_INVESTMENT)}.`);
      return;
    }

    if (investAmount > CURRENCY.MAX_INVESTMENT) {
      Alert.alert('Erro', `Valor máximo: ${formatCurrency(CURRENCY.MAX_INVESTMENT)}.`);
      return;
    }

    if (investAmount > walletBalance) {
      Alert.alert('Erro', 'Saldo insuficiente para esta aplicação.');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Não foi possível identificar o usuário.');
      return;
    }

    setLoading(true);
    try {
      await walletService.invest({ userId, amount: investAmount });

      Alert.alert(
        'Sucesso',
        `Investimento de ${formatCurrency(investAmount)} realizado.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível concluir o investimento.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedAmounts = [100, 500, 1000, 5000];

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
          <Text style={styles.title}>Investir no pool</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balanceValue}>{formatCurrency(walletBalance)}</Text>
          </View>

          {poolStatus && (
            <View style={styles.poolCard}>
              <Text style={styles.poolTitle}>Pool em tempo real</Text>
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

          <View style={styles.form}>
            <Text style={styles.formTitle}>Quanto você quer investir?</Text>
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

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleInvest}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Processando...' : 'Confirmar investimento'}</Text>
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