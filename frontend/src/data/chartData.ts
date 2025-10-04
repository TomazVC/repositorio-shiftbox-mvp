/**
 * Dados Mock para Gráficos - ShiftBox MVP
 * Dados realísticos baseados no pool de R$ 1.000.000
 */

// 🥧 Dados para Gráfico de Pizza - Composição do Pool
export const poolCompositionData = [
  {
    name: 'Disponível',
    value: 650000,
    percentage: 65,
    color: '#04BF55', // Verde ShiftBox
    description: 'Capital disponível para empréstimos'
  },
  {
    name: 'Emprestado',
    value: 350000,
    percentage: 35,
    color: '#3B82F6', // Azul
    description: 'Capital já emprestado'
  },
  {
    name: 'Reserva',
    value: 100000,
    percentage: 10,
    color: '#F59E0B', // Amarelo
    description: 'Reserva de segurança'
  }
]

// 📈 Dados para Gráfico de Linha - Evolução dos Investimentos (últimos 12 meses)
export const investmentEvolutionData = [
  { month: 'Jan', value: 450000, investments: 12, date: '2024-01' },
  { month: 'Fev', value: 520000, investments: 15, date: '2024-02' },
  { month: 'Mar', value: 580000, investments: 18, date: '2024-03' },
  { month: 'Abr', value: 620000, investments: 22, date: '2024-04' },
  { month: 'Mai', value: 680000, investments: 28, date: '2024-05' },
  { month: 'Jun', value: 720000, investments: 32, date: '2024-06' },
  { month: 'Jul', value: 780000, investments: 38, date: '2024-07' },
  { month: 'Ago', value: 820000, investments: 42, date: '2024-08' },
  { month: 'Set', value: 890000, investments: 47, date: '2024-09' },
  { month: 'Out', value: 950000, investments: 52, date: '2024-10' },
  { month: 'Nov', value: 980000, investments: 55, date: '2024-11' },
  { month: 'Dez', value: 1000000, investments: 58, date: '2024-12' }
]

// 📊 Dados para Gráfico de Barras - Status dos Empréstimos
export const loanStatusData = [
  {
    status: 'Pendentes',
    count: 8,
    value: 180000,
    color: '#F59E0B', // Amarelo
    description: 'Aguardando aprovação'
  },
  {
    status: 'Aprovados',
    count: 25,
    value: 650000,
    color: '#04BF55', // Verde
    description: 'Empréstimos aprovados'
  },
  {
    status: 'Ativos',
    count: 18,
    value: 420000,
    color: '#3B82F6', // Azul
    description: 'Em pagamento'
  },
  {
    status: 'Pagos',
    count: 42,
    value: 980000,
    color: '#10B981', // Verde claro
    description: 'Quitados com sucesso'
  },
  {
    status: 'Rejeitados',
    count: 5,
    value: 85000,
    color: '#EF4444', // Vermelho
    description: 'Não aprovados'
  }
]

// 📊 Dados para Métricas com Sparklines
export const sparklineData = {
  totalBalance: [
    { value: 920000 },
    { value: 950000 },
    { value: 980000 },
    { value: 965000 },
    { value: 1000000 },
    { value: 1020000 },
    { value: 1000000 }
  ],
  activeInvestors: [
    { value: 38 },
    { value: 42 },
    { value: 45 },
    { value: 44 },
    { value: 47 },
    { value: 45 },
    { value: 45 }
  ],
  loanApprovals: [
    { value: 65 },
    { value: 72 },
    { value: 68 },
    { value: 75 },
    { value: 80 },
    { value: 78 },
    { value: 82 }
  ]
}

// 🎯 Dados para Performance Mensal
export const monthlyPerformanceData = [
  {
    month: 'Jan',
    revenue: 45000,
    costs: 12000,
    profit: 33000,
    roi: 7.3
  },
  {
    month: 'Fev',
    revenue: 52000,
    costs: 14000,
    profit: 38000,
    roi: 7.8
  },
  {
    month: 'Mar',
    revenue: 58000,
    costs: 15000,
    profit: 43000,
    roi: 8.2
  },
  {
    month: 'Abr',
    revenue: 62000,
    costs: 16000,
    profit: 46000,
    roi: 8.5
  },
  {
    month: 'Mai',
    revenue: 68000,
    costs: 18000,
    profit: 50000,
    roi: 8.8
  },
  {
    month: 'Jun',
    revenue: 72000,
    costs: 19000,
    profit: 53000,
    roi: 9.1
  }
]

// 🏆 KPIs do Dashboard
export const dashboardKPIs = {
  totalPoolValue: 1000000,
  availableForLoans: 650000,
  activeLoans: 350000,
  utilizationRate: 35,
  totalInvestors: 45,
  activeInvestors: 42,
  averageReturn: 12.5,
  monthlyGrowth: 8.2,
  approvalRate: 82,
  defaultRate: 2.1
}

// 🎨 Paleta de Cores para Gráficos
export const chartColors = {
  primary: '#04BF55',      // Verde ShiftBox
  secondary: '#3B82F6',    // Azul
  success: '#10B981',      // Verde claro
  warning: '#F59E0B',      // Amarelo
  danger: '#EF4444',       // Vermelho
  info: '#06B6D4',         // Ciano
  neutral: '#6B7280',      // Cinza
  light: '#F3F4F6',        // Cinza claro
  dark: '#1F2937'          // Cinza escuro
}

// 📱 Configurações responsivas para gráficos
export const chartResponsiveConfig = {
  mobile: {
    width: '100%',
    height: 200,
    margin: { top: 20, right: 20, bottom: 20, left: 20 }
  },
  tablet: {
    width: '100%',
    height: 300,
    margin: { top: 30, right: 30, bottom: 30, left: 30 }
  },
  desktop: {
    width: '100%',
    height: 350,
    margin: { top: 40, right: 40, bottom: 40, left: 40 }
  }
}