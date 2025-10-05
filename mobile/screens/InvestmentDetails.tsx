import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS } from '../constants';
import { RootStackParamList, InvestmentDetailed, EarningsHistory, Projection } from '../types';
import { authService } from '../services/authService';

const { width } = Dimensions.get('window');

type InvestmentDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InvestmentDetails'
>;

type Props = {
  navigation: InvestmentDetailsNavigationProp;
};

export default function InvestmentDetails({ navigation }: Props) {
  const [investments, setInvestments] = useState<InvestmentDetailed[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [currentYield, setCurrentYield] = useState(8.5);
  const [earningsHistory, setEarningsHistory] = useState<EarningsHistory[]>([]);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const loadInvestmentData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user?.id) {
        throw new Error('Usuário não encontrado');
      }

      // TODO: Implementar chamadas reais para API
      // Mock data para demonstração
      setInvestments([
        {
          id: '1',
          amount: 5000,
          shares: 5000,
          investment_date: '2024-09-15T10:00:00Z',
          status: 'ACTIVE',
        },
        {
          id: '2',
          amount: 2500,
          shares: 2500,
          investment_date: '2024-10-01T14:30:00Z',
          status: 'ACTIVE',
        },
      ]);

      setTotalInvested(7500);
      setTotalEarnings(425.50);
      setCurrentYield(8.5);

      setEarningsHistory([
        { date: '2024-10-01', amount: 42.50, type: 'INTEREST' },
        { date: '2024-09-30', amount: 38.75, type: 'INTEREST' },
        { date: '2024-09-29', amount: 41.20, type: 'INTEREST' },
        { date: '2024-09-28', amount: 39.80, type: 'INTEREST' },
        { date: '2024-09-27', amount: 45.10, type: 'INTEREST' },
      ]);

      setProjections([
        { period: '1M', estimated_return: 63.75, total_amount: 7563.75 },
        { period: '3M', estimated_return: 191.25, total_amount: 7691.25 },
        { period: '6M', estimated_return: 382.50, total_amount: 7882.50 },
        { period: '1Y', estimated_return: 765.00, total_amount: 8265.00 },
      ]);

    } catch (error: any) {
      console.warn('Erro ao carregar dados de investimentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados dos investimentos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInvestmentData();
    }, [loadInvestmentData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvestmentData();
    setRefreshing(false);
  };

  const handleRedeem = (investmentId: string) => {
    Alert.alert(
      'Resgatar Investimento',
      'Deseja realmente resgatar este investimento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resgatar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar lógica de resgate
            Alert.alert('Sucesso', 'Solicitação de resgate enviada!');
          },
        },
      ]
    );
  };

  const renderInvestmentCard = (investment: InvestmentDetailed) => {
    const returnPercentage = ((totalEarnings / totalInvested) * 100);
    
    return (
      <View key={investment.id} style={styles.investmentCard}>
        <View style={styles.investmentHeader}>
          <View style={styles.investmentInfo}>
            <Text style={styles.investmentAmount}>
              {formatCurrency(investment.amount)}
            </Text>
            <Text style={styles.investmentDate}>
              {new Date(investment.investment_date).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={styles.investmentStatus}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: investment.status === 'ACTIVE' ? COLORS.SUCCESS : COLORS.WARNING }
            ]}>
              <Text style={styles.statusText}>
                {investment.status === 'ACTIVE' ? 'Ativo' : 'Pendente'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.investmentStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Cotas</Text>
            <Text style={styles.statValue}>{investment.shares.toLocaleString('pt-BR')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rendimento</Text>
            <Text style={[styles.statValue, { color: COLORS.SUCCESS }]}>
              +{returnPercentage.toFixed(2)}%
            </Text>
          </View>
        </View>

        {investment.status === 'ACTIVE' && (
          <TouchableOpacity
            style={styles.redeemButton}
            onPress={() => handleRedeem(investment.id)}
          >
            <Text style={styles.redeemButtonText}>Resgatar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEarningsItem = (earning: EarningsHistory) => {
    const getEarningIcon = () => {
      switch (earning.type) {
        case 'INTEREST': return 'trending-up';
        case 'BONUS': return 'gift';
        case 'FEE_REFUND': return 'cash-refund';
        default: return 'trending-up';
      }
    };

    const getEarningLabel = () => {
      switch (earning.type) {
        case 'INTEREST': return 'Juros do pool';
        case 'BONUS': return 'Bônus';
        case 'FEE_REFUND': return 'Reembolso de taxa';
        default: return 'Rendimento';
      }
    };

    return (
      <View key={earning.date} style={styles.earningItem}>
        <View style={styles.earningIcon}>
          <MaterialCommunityIcons
            name={getEarningIcon()}
            size={20}
            color={COLORS.SUCCESS}
          />
        </View>
        <View style={styles.earningInfo}>
          <Text style={styles.earningLabel}>{getEarningLabel()}</Text>
          <Text style={styles.earningDate}>
            {new Date(earning.date).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <Text style={[styles.earningAmount, { color: COLORS.SUCCESS }]}>
          +{formatCurrency(earning.amount)}
        </Text>
      </View>
    );
  };

  const renderProjectionItem = (projection: Projection) => {
    const getPeriodLabel = (period: string) => {
      switch (period) {
        case '1M': return '1 mês';
        case '3M': return '3 meses';
        case '6M': return '6 meses';
        case '1Y': return '1 ano';
        default: return period;
      }
    };

    return (
      <View key={projection.period} style={styles.projectionItem}>
        <Text style={styles.projectionPeriod}>{getPeriodLabel(projection.period)}</Text>
        <View style={styles.projectionValues}>
          <Text style={styles.projectionReturn}>
            +{formatCurrency(projection.estimated_return)}
          </Text>
          <Text style={styles.projectionTotal}>
            Total: {formatCurrency(projection.total_amount)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Meus Investimentos</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Investido</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalInvested)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Rendimentos</Text>
          <Text style={[styles.summaryValue, { color: COLORS.SUCCESS }]}>
            {formatCurrency(totalEarnings)}
          </Text>
        </View>
      </View>

      {/* Yield Card */}
      <View style={styles.yieldCard}>
        <View style={styles.yieldHeader}>
          <Text style={styles.yieldTitle}>Rendimento Atual</Text>
          <View style={styles.yieldBadge}>
            <Text style={styles.yieldPercentage}>{currentYield}% a.a.</Text>
          </View>
        </View>
        <Text style={styles.yieldDescription}>
          Baseado no desempenho dos últimos 30 dias
        </Text>
      </View>

      {/* Investments List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investimentos Ativos</Text>
        {investments.map(renderInvestmentCard)}
      </View>

      {/* Earnings History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de Rendimentos</Text>
        <View style={styles.earningsCard}>
          {earningsHistory.map(renderEarningsItem)}
        </View>
      </View>

      {/* Projections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projeções de Rendimento</Text>
        <View style={styles.projectionsCard}>
          <Text style={styles.projectionsNote}>
            * Estimativas baseadas no rendimento atual de {currentYield}% a.a.
          </Text>
          {projections.map(renderProjectionItem)}
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
  scrollContent: {
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.XL,
    paddingBottom: SPACING['2XL'],
    gap: SPACING.LG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.SM,
  },
  pageTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: SPACING.BASE,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.BG_CARD,
    padding: SPACING.LG,
    borderRadius: COMPONENTS.CARD_RADIUS,
    alignItems: 'center',
    ...COMPONENTS.CARD_SHADOW,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  summaryValue: {
    fontSize: FONT_SIZES.XL,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  yieldCard: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.LG,
    borderRadius: COMPONENTS.CARD_RADIUS,
    ...COMPONENTS.CARD_SHADOW,
  },
  yieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  yieldTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.PRIMARY_CONTRAST,
  },
  yieldBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.XS,
    borderRadius: COMPONENTS.INPUT_RADIUS,
  },
  yieldPercentage: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '700',
    color: COLORS.PRIMARY_CONTRAST,
  },
  yieldDescription: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY_CONTRAST,
    opacity: 0.8,
  },
  section: {
    gap: SPACING.BASE,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  investmentCard: {
    backgroundColor: COLORS.BG_CARD,
    padding: SPACING.LG,
    borderRadius: COMPONENTS.CARD_RADIUS,
    marginBottom: SPACING.BASE,
    ...COMPONENTS.CARD_SHADOW,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.BASE,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentAmount: {
    fontSize: FONT_SIZES.XL,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  investmentDate: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  investmentStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.XS,
    borderRadius: COMPONENTS.INPUT_RADIUS,
  },
  statusText: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '600',
    color: COLORS.PRIMARY_CONTRAST,
  },
  investmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.BASE,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  statValue: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  redeemButton: {
    backgroundColor: COLORS.BG_MUTED,
    paddingVertical: SPACING.BASE,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    alignItems: 'center',
  },
  redeemButtonText: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  earningsCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.BASE,
    ...COMPONENTS.CARD_SHADOW,
  },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  earningIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.BG_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.BASE,
  },
  earningInfo: {
    flex: 1,
  },
  earningLabel: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  earningDate: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  earningAmount: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
  },
  projectionsCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    ...COMPONENTS.CARD_SHADOW,
  },
  projectionsNote: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LG,
    fontStyle: 'italic',
  },
  projectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.BASE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  projectionPeriod: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  projectionValues: {
    alignItems: 'flex-end',
  },
  projectionReturn: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
    color: COLORS.SUCCESS,
  },
  projectionTotal: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
});