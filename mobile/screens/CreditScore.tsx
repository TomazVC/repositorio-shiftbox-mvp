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
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS } from '../constants';
import { authService } from '../services/authService';
import { ScoreFactors, ScoreHistoryItem } from '../types';

const { width } = Dimensions.get('window');

export default function CreditScore() {
  const [score, setScore] = useState<number>(750);
  const [scoreClass, setScoreClass] = useState<string>('Bom Pagador');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [factors, setFactors] = useState<ScoreFactors>({
    payment_history: 85,
    credit_utilization: 30,
    account_age: 70,
    transaction_volume: 60,
    risk_events: 95,
  });
  const [history, setHistory] = useState<ScoreHistoryItem[]>([
    { date: '2024-10', score: 750, change: +15 },
    { date: '2024-09', score: 735, change: -10 },
    { date: '2024-08', score: 745, change: +25 },
    { date: '2024-07', score: 720, change: +5 },
  ]);

  const loadScoreData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user?.id) {
        throw new Error('Usuário não encontrado');
      }

      // TODO: Implementar chamada real para API de score
      // const scoreData = await scoreService.getUserScore(user.id);
      // setScore(scoreData.score);
      // setScoreClass(scoreData.classification);
      // setFactors(scoreData.factors);
      // setHistory(scoreData.history);

    } catch (error: any) {
      console.warn('Erro ao carregar score:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do score.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadScoreData();
    }, [loadScoreData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScoreData();
    setRefreshing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return COLORS.SUCCESS;
    if (score >= 600) return COLORS.PRIMARY;
    if (score >= 400) return COLORS.WARNING;
    return COLORS.ERROR;
  };

  const getScoreDescription = (score: number) => {
    if (score >= 800) return 'Excelente! Você tem acesso às melhores taxas.';
    if (score >= 600) return 'Bom score. Taxas competitivas disponíveis.';
    if (score >= 400) return 'Score regular. Algumas restrições podem aplicar.';
    return 'Score baixo. Trabalhe para melhorar seu histórico.';
  };

  const renderScoreGauge = () => {
    const scorePercentage = (score / 1000) * 100;
    const scoreColor = getScoreColor(score);

    return (
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeBackground}>
          <View 
            style={[
              styles.gaugeFill, 
              { 
                width: `${scorePercentage}%`,
                backgroundColor: scoreColor,
              }
            ]} 
          />
        </View>
        <View style={styles.scoreDisplay}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {score}
          </Text>
          <Text style={styles.scoreMax}>/ 1000</Text>
        </View>
        <Text style={styles.scoreClass}>{scoreClass}</Text>
        <Text style={styles.scoreDescription}>
          {getScoreDescription(score)}
        </Text>
      </View>
    );
  };

  const renderFactorItem = (
    label: string, 
    value: number, 
    icon: keyof typeof MaterialCommunityIcons.glyphMap
  ) => {
    const getFactorColor = (val: number) => {
      if (val >= 80) return COLORS.SUCCESS;
      if (val >= 60) return COLORS.PRIMARY;
      if (val >= 40) return COLORS.WARNING;
      return COLORS.ERROR;
    };

    return (
      <View style={styles.factorItem}>
        <View style={styles.factorHeader}>
          <View style={styles.factorIconWrapper}>
            <MaterialCommunityIcons 
              name={icon} 
              size={20} 
              color={getFactorColor(value)} 
            />
          </View>
          <View style={styles.factorInfo}>
            <Text style={styles.factorLabel}>{label}</Text>
            <Text style={[styles.factorValue, { color: getFactorColor(value) }]}>
              {value}%
            </Text>
          </View>
        </View>
        <View style={styles.factorBarBackground}>
          <View 
            style={[
              styles.factorBarFill,
              { 
                width: `${value}%`,
                backgroundColor: getFactorColor(value),
              }
            ]}
          />
        </View>
      </View>
    );
  };

  const renderHistoryItem = (item: ScoreHistoryItem) => {
    const isPositive = item.change > 0;
    return (
      <View key={item.date} style={styles.historyItem}>
        <View style={styles.historyDate}>
          <Text style={styles.historyMonth}>{item.date}</Text>
        </View>
        <View style={styles.historyScore}>
          <Text style={styles.historyScoreNumber}>{item.score}</Text>
        </View>
        <View style={styles.historyChange}>
          <MaterialCommunityIcons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={16}
            color={isPositive ? COLORS.SUCCESS : COLORS.ERROR}
          />
          <Text 
            style={[
              styles.historyChangeText,
              { color: isPositive ? COLORS.SUCCESS : COLORS.ERROR }
            ]}
          >
            {isPositive ? '+' : ''}{item.change}
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
        <Text style={styles.pageTitle}>Meu Score</Text>
        <TouchableOpacity style={styles.infoButton}>
          <MaterialCommunityIcons 
            name="information-outline" 
            size={24} 
            color={COLORS.PRIMARY} 
          />
        </TouchableOpacity>
      </View>

      {/* Score Gauge */}
      <View style={styles.scoreCard}>
        {renderScoreGauge()}
      </View>

      {/* Score Factors */}
      <View style={styles.factorsCard}>
        <Text style={styles.cardTitle}>Fatores que influenciam seu score</Text>
        <View style={styles.factorsList}>
          {renderFactorItem('Histórico de pagamentos', factors.payment_history, 'clock-check')}
          {renderFactorItem('Uso do crédito', factors.credit_utilization, 'credit-card')}
          {renderFactorItem('Tempo de conta', factors.account_age, 'calendar-clock')}
          {renderFactorItem('Volume de transações', factors.transaction_volume, 'chart-line')}
          {renderFactorItem('Eventos de risco', factors.risk_events, 'shield-check')}
        </View>
      </View>

      {/* Score History */}
      <View style={styles.historyCard}>
        <Text style={styles.cardTitle}>Evolução do score</Text>
        <View style={styles.historyList}>
          {history.map(renderHistoryItem)}
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.cardTitle}>Dicas para melhorar seu score</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.SUCCESS} />
            <Text style={styles.tipText}>Pague suas parcelas em dia</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.SUCCESS} />
            <Text style={styles.tipText}>Mantenha dados atualizados</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.SUCCESS} />
            <Text style={styles.tipText}>Use o app regularmente</Text>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: FONT_SIZES['2XL'],
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  infoButton: {
    padding: SPACING.SM,
  },
  scoreCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.XL,
    alignItems: 'center',
    ...COMPONENTS.CARD_SHADOW,
  },
  gaugeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  gaugeBackground: {
    width: width * 0.6,
    height: 8,
    backgroundColor: COLORS.BG_MUTED,
    borderRadius: 4,
    marginBottom: SPACING.LG,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.SM,
  },
  scoreNumber: {
    fontSize: FONT_SIZES['4XL'],
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.XS,
  },
  scoreClass: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  scoreDescription: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  factorsCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    ...COMPONENTS.CARD_SHADOW,
  },
  cardTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LG,
  },
  factorsList: {
    gap: SPACING.LG,
  },
  factorItem: {
    gap: SPACING.SM,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  factorIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.BG_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.SM,
  },
  factorInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorLabel: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  factorValue: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
  },
  factorBarBackground: {
    height: 4,
    backgroundColor: COLORS.BG_MUTED,
    borderRadius: 2,
    marginLeft: 44,
  },
  factorBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  historyCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    ...COMPONENTS.CARD_SHADOW,
  },
  historyList: {
    gap: SPACING.BASE,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  historyDate: {
    flex: 1,
  },
  historyMonth: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  historyScore: {
    flex: 1,
    alignItems: 'center',
  },
  historyScoreNumber: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  historyChange: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.XS,
  },
  historyChangeText: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    ...COMPONENTS.CARD_SHADOW,
  },
  tipsList: {
    gap: SPACING.BASE,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  tipText: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
});