// Dados compartilhados entre todos os módulos
// Centraliza usuários, investimentos e empréstimos para manter consistência

import { 
  Transaction, 
  Wallet, 
  QueueRequest, 
  CreditScore, 
  ScoreHistory, 
  RiskEvent,
  Distribution,
  LoanApplication
} from '../types/wallet'

export interface User {
  id: number
  name: string
  email: string
  kyc_status: 'pending' | 'approved' | 'rejected'
  saldo: number
  created_at: string
  hash?: string
}

export interface Investment {
  id: number
  user_id: number
  user_name: string
  valor: number
  status: 'ativo' | 'resgatado'
  created_at: string
  rentabilidade: number
}

export interface Loan {
  id: number
  user_id: number
  user_name: string
  valor: number
  status: 'pendente' | 'aprovado' | 'pago' | 'rejeitado'
  created_at: string
  taxa_juros: number
  finalidade?: string
}

// Usuários centralizados - fonte única da verdade
export const mockUsers: User[] = [
  { 
    id: 1, 
    name: 'João Silva', 
    email: 'joao@email.com', 
    kyc_status: 'approved', 
    saldo: 15000, 
    created_at: '2025-01-15',
    hash: 'a7f8d6e2b9c1435f8e7a2d4b6f9c8e1a3b5d7f2e'
  },
  { 
    id: 2, 
    name: 'Maria Santos', 
    email: 'maria@email.com', 
    kyc_status: 'pending', 
    saldo: 28000, 
    created_at: '2025-01-16',
    hash: 'b3f5c8e1a9d2674e5f8a1c3b6d9e2f7a4c6e8b1d'
  },
  { 
    id: 3, 
    name: 'Pedro Costa', 
    email: 'pedro@email.com', 
    kyc_status: 'approved', 
    saldo: 42000, 
    created_at: '2025-01-14',
    hash: 'c9e2d5f8a1b4367c6f9e2a5d8b1e4f7c3a6b9d2e'
  },
  { 
    id: 4, 
    name: 'Ana Oliveira', 
    email: 'ana@email.com', 
    kyc_status: 'rejected', 
    saldo: 0, 
    created_at: '2025-01-17',
    hash: 'd1f4c7a2e9b6538d4e7a1f3c6b9e2d5f8a1c4b7e'
  },
  {
    id: 5,
    name: 'Carlos Mendes',
    email: 'carlos@email.com',
    kyc_status: 'approved',
    saldo: 22000,
    created_at: '2025-01-12',
    hash: 'e5a8b2f9c6d3814e7f2a5c8b1d4e9f6a3c7b2e5d'
  },
  {
    id: 6,
    name: 'Fernanda Lima',
    email: 'fernanda@email.com',
    kyc_status: 'pending',
    saldo: 18000,
    created_at: '2025-01-18',
    hash: 'f2c5e8b1d9a4637f5e8a2c5b7d1e4f9c6a3b8d2e'
  },
  {
    id: 7,
    name: 'Roberto Santos',
    email: 'roberto@email.com',
    kyc_status: 'approved',
    saldo: 35000,
    created_at: '2025-01-05',
    hash: 'g9f6c3e1b8d5427a6e9c2f5b8e1a4d7f3c6b9e2a'
  },
  {
    id: 8,
    name: 'Juliana Costa',
    email: 'juliana@email.com',
    kyc_status: 'approved',
    saldo: 12000,
    created_at: '2025-01-17',
    hash: 'h6c9f2e5b1d8374a5c8f1e4b7d2a5f8e1c4b7a2e'
  }
]

// Investimentos vinculados aos usuários
export const mockInvestments: Investment[] = [
  { 
    id: 1, 
    user_id: 1, 
    user_name: 'João Silva', 
    valor: 10000, 
    status: 'ativo', 
    created_at: '2025-01-10', 
    rentabilidade: 12.5 
  },
  { 
    id: 2, 
    user_id: 2, 
    user_name: 'Maria Santos', 
    valor: 25000, 
    status: 'ativo', 
    created_at: '2025-01-12', 
    rentabilidade: 12.5 
  },
  { 
    id: 3, 
    user_id: 3, 
    user_name: 'Pedro Costa', 
    valor: 15000, 
    status: 'resgatado', 
    created_at: '2025-01-08', 
    rentabilidade: 12.5 
  },
  {
    id: 4,
    user_id: 7,
    user_name: 'Roberto Santos',
    valor: 30000,
    status: 'ativo',
    created_at: '2025-01-06',
    rentabilidade: 12.5
  }
]

// Empréstimos vinculados aos usuários
export const mockLoans: Loan[] = [
  { 
    id: 1, 
    user_id: 5, 
    user_name: 'Carlos Mendes', 
    valor: 5000, 
    status: 'aprovado', 
    created_at: '2025-01-15', 
    taxa_juros: 2.5,
    finalidade: 'Capital de giro'
  },
  { 
    id: 2, 
    user_id: 6, 
    user_name: 'Fernanda Lima', 
    valor: 8000, 
    status: 'pendente', 
    created_at: '2025-01-18', 
    taxa_juros: 2.5,
    finalidade: 'Expansão do negócio'
  },
  { 
    id: 3, 
    user_id: 7, 
    user_name: 'Roberto Santos', 
    valor: 12000, 
    status: 'pago', 
    created_at: '2025-01-05', 
    taxa_juros: 2.5,
    finalidade: 'Equipamentos'
  },
  { 
    id: 4, 
    user_id: 8, 
    user_name: 'Juliana Costa', 
    valor: 3000, 
    status: 'rejeitado', 
    created_at: '2025-01-17', 
    taxa_juros: 2.5,
    finalidade: 'Marketing digital'
  }
]

// Funções utilitárias para buscar dados
export const getUserById = (id: number): User | undefined => {
  return mockUsers.find(user => user.id === id)
}

export const getUsersByStatus = (status: User['kyc_status']): User[] => {
  return mockUsers.filter(user => user.kyc_status === status)
}

export const getActiveUsers = (): User[] => {
  return mockUsers.filter(user => user.kyc_status === 'approved')
}

export const getInvestmentsByUserId = (userId: number): Investment[] => {
  return mockInvestments.filter(investment => investment.user_id === userId)
}

export const getLoansByUserId = (userId: number): Loan[] => {
  return mockLoans.filter(loan => loan.user_id === userId)
}

// Função para gerar hash único para novos usuários
export const generateUserHash = (): string => {
  return Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

// Dados para sistema de carteira

export const mockWallets: Wallet[] = [
  {
    id: 1,
    user_id: 1,
    available_balance: 15000,
    blocked_balance: 0,
    total_balance: 15000,
    last_updated: '2025-01-25T10:30:00Z'
  },
  {
    id: 2,
    user_id: 2,
    available_balance: 26000,
    blocked_balance: 2000,
    total_balance: 28000,
    last_updated: '2025-01-25T09:15:00Z'
  },
  {
    id: 3,
    user_id: 3,
    available_balance: 42000,
    blocked_balance: 0,
    total_balance: 42000,
    last_updated: '2025-01-25T08:45:00Z'
  },
  {
    id: 4,
    user_id: 5,
    available_balance: 20000,
    blocked_balance: 2000,
    total_balance: 22000,
    last_updated: '2025-01-25T11:20:00Z'
  },
  {
    id: 5,
    user_id: 6,
    available_balance: 18000,
    blocked_balance: 0,
    total_balance: 18000,
    last_updated: '2025-01-25T07:30:00Z'
  },
  {
    id: 6,
    user_id: 7,
    available_balance: 35000,
    blocked_balance: 0,
    total_balance: 35000,
    last_updated: '2025-01-25T06:00:00Z'
  },
  {
    id: 7,
    user_id: 8,
    available_balance: 12000,
    blocked_balance: 0,
    total_balance: 12000,
    last_updated: '2025-01-25T12:00:00Z'
  }
]

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    user_id: 1,
    type: 'deposit',
    amount: 5000,
    status: 'completed',
    description: 'Depósito via PIX',
    created_at: '2025-01-25T08:30:00Z',
    completed_at: '2025-01-25T08:31:00Z',
    reference_id: 'PIX123456',
    metadata: {
      pix_key: '11999999999'
    }
  },
  {
    id: 2,
    user_id: 1,
    type: 'investment',
    amount: -10000,
    status: 'completed',
    description: 'Investimento em Pool',
    created_at: '2025-01-24T14:20:00Z',
    completed_at: '2025-01-24T14:20:00Z',
    metadata: {
      investment_id: 1
    }
  },
  {
    id: 3,
    user_id: 2,
    type: 'withdraw',
    amount: -2000,
    status: 'pending',
    description: 'Saque via PIX',
    created_at: '2025-01-25T10:00:00Z',
    metadata: {
      pix_key: '21888888888'
    }
  },
  {
    id: 4,
    user_id: 5,
    type: 'loan_disbursement',
    amount: 5000,
    status: 'completed',
    description: 'Liberação de empréstimo',
    created_at: '2025-01-20T16:45:00Z',
    completed_at: '2025-01-20T16:45:00Z',
    metadata: {
      loan_id: 1
    }
  },
  {
    id: 5,
    user_id: 5,
    type: 'loan_payment',
    amount: -1250,
    status: 'completed',
    description: 'Pagamento de parcela',
    created_at: '2025-01-25T09:00:00Z',
    completed_at: '2025-01-25T09:00:00Z',
    metadata: {
      loan_id: 1
    }
  },
  {
    id: 6,
    user_id: 1,
    type: 'interest_distribution',
    amount: 125,
    status: 'completed',
    description: 'Distribuição de juros',
    created_at: '2025-01-25T00:00:00Z',
    completed_at: '2025-01-25T00:00:00Z',
    metadata: {
      investment_id: 1
    }
  }
]

export const mockQueueRequests: QueueRequest[] = [
  {
    id: 1,
    user_id: 2,
    type: 'withdraw',
    amount: 2000,
    status: 'queued',
    priority: 1,
    estimated_completion: '2025-01-26T10:00:00Z',
    created_at: '2025-01-25T10:00:00Z',
    position_in_queue: 1
  },
  {
    id: 2,
    user_id: 6,
    type: 'loan_request',
    amount: 8000,
    status: 'queued',
    priority: 2,
    estimated_completion: '2025-01-27T14:00:00Z',
    created_at: '2025-01-25T11:30:00Z',
    position_in_queue: 2
  }
]

export const mockCreditScores: CreditScore[] = [
  {
    id: 1,
    user_id: 1,
    score: 785,
    risk_level: 'good',
    factors: {
      payment_history: 0.35,
      credit_utilization: 0.30,
      length_of_history: 0.15,
      types_of_credit: 0.10,
      recent_inquiries: 0.10
    },
    explanation: [
      'Histórico de pagamentos consistente',
      'Baixa utilização de crédito disponível',
      'Relacionamento bancário de longo prazo'
    ],
    last_updated: '2025-01-25T06:00:00Z',
    version: 1
  },
  {
    id: 2,
    user_id: 2,
    score: 650,
    risk_level: 'fair',
    factors: {
      payment_history: 0.30,
      credit_utilization: 0.45,
      length_of_history: 0.10,
      types_of_credit: 0.08,
      recent_inquiries: 0.07
    },
    explanation: [
      'Alguns atrasos pontuais nos últimos 12 meses',
      'Alta utilização de cartão de crédito',
      'Renda comprovada estável'
    ],
    last_updated: '2025-01-25T06:00:00Z',
    version: 1
  },
  {
    id: 3,
    user_id: 5,
    score: 820,
    risk_level: 'excellent',
    factors: {
      payment_history: 0.40,
      credit_utilization: 0.25,
      length_of_history: 0.20,
      types_of_credit: 0.10,
      recent_inquiries: 0.05
    },
    explanation: [
      'Excelente histórico de pagamentos',
      'Diversificação adequada de produtos financeiros',
      'Baixa utilização de crédito disponível',
      'Relacionamento bancário de longa data'
    ],
    last_updated: '2025-01-25T06:00:00Z',
    version: 1
  }
]

export const mockScoreHistory: ScoreHistory[] = [
  {
    id: 1,
    user_id: 1,
    score: 785,
    risk_level: 'good',
    reason: 'Score inicial',
    created_at: '2025-01-25T06:00:00Z'
  },
  {
    id: 2,
    user_id: 1,
    score: 775,
    risk_level: 'good',
    reason: 'Atraso de 3 dias',
    created_at: '2025-01-20T06:00:00Z'
  },
  {
    id: 3,
    user_id: 1,
    score: 780,
    risk_level: 'good',
    reason: 'Pagamento realizado',
    created_at: '2025-01-15T06:00:00Z'
  },
  {
    id: 4,
    user_id: 2,
    score: 650,
    risk_level: 'fair',
    reason: 'Score inicial',
    created_at: '2025-01-25T06:00:00Z'
  },
  {
    id: 5,
    user_id: 5,
    score: 820,
    risk_level: 'excellent',
    reason: 'Score inicial',
    created_at: '2025-01-25T06:00:00Z'
  }
]

// Funções utilitárias para dados de carteira

export const getWalletByUserId = (userId: number): Wallet | undefined => {
  return mockWallets.find(wallet => wallet.user_id === userId)
}

export const getTransactionsByUserId = (userId: number): Transaction[] => {
  return mockTransactions
    .filter(transaction => transaction.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export const getCreditScoreByUserId = (userId: number): CreditScore | undefined => {
  return mockCreditScores.find(score => score.user_id === userId)
}

export const getScoreHistoryByUserId = (userId: number): ScoreHistory[] => {
  return mockScoreHistory
    .filter(history => history.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export const getQueueRequestsByUserId = (userId: number): QueueRequest[] => {
  return mockQueueRequests.filter(request => request.user_id === userId)
}

// Dados mock para aplicações de empréstimo
export const mockLoanApplications: LoanApplication[] = [
  {
    id: 1,
    user_id: 1,
    requested_amount: 50000,
    duration_months: 24,
    purpose: 'capital_giro',
    status: 'under_review',
    proposed_interest_rate: 2.5,
    application_date: '2024-01-15',
    applicant_info: {
      document: '123.456.789-01',
      monthly_income: 15000,
      company_name: 'Tech Solutions Ltda'
    },
    risk_analysis: {
      score: 0.78,
      risk_level: 'low',
      factors: {
        income_verification: 0.9,
        credit_history: 0.8,
        debt_to_income: 0.7,
        employment_stability: 0.85,
        collateral_value: 0.6,
        positive: [
          'Renda comprovada acima de R$ 10.000',
          'Histórico de crédito limpo',
          'Empresa há mais de 2 anos no mercado',
          'Score de crédito acima de 700'
        ],
        negative: [
          'Alto endividamento em outras instituições',
          'Variação de renda nos últimos 6 meses'
        ]
      },
      recommendations: [
        'Reduzir valor para R$ 40.000',
        'Solicitar garantia adicional',
        'Prazo máximo de 18 meses recomendado'
      ]
    }
  },
  {
    id: 2,
    user_id: 2,
    requested_amount: 25000,
    duration_months: 12,
    purpose: 'equipamentos',
    status: 'approved',
    proposed_interest_rate: 2.3,
    application_date: '2024-01-10',
    applicant_info: {
      document: '987.654.321-00',
      monthly_income: 8500,
      company_name: 'Café Premium ME'
    },
    risk_analysis: {
      score: 0.85,
      risk_level: 'low',
      factors: {
        income_verification: 0.95,
        credit_history: 0.9,
        debt_to_income: 0.8,
        employment_stability: 0.9,
        collateral_value: 0.75,
        positive: [
          'Excelente histórico de pagamentos',
          'Baixo endividamento',
          'Negócio estável há 3 anos',
          'Garantia real oferecida'
        ],
        negative: [
          'Setor com sazonalidade'
        ]
      },
      recommendations: [
        'Aprovação recomendada',
        'Taxa preferencial aplicável'
      ]
    },
    approval_details: {
      approved: true,
      approved_amount: 25000,
      final_interest_rate: 2.1,
      approval_date: '2024-01-12',
      approved_by: 'analista_001',
      comments: 'Excelente perfil de risco. Aprovado com taxa preferencial.',
      conditions: [
        'Comprovação de renda atualizada',
        'Seguro de equipamentos obrigatório',
        'Prestação máxima de 30% da renda'
      ]
    }
  },
  {
    id: 3,
    user_id: 3,
    requested_amount: 100000,
    duration_months: 36,
    purpose: 'expansao',
    status: 'rejected',
    proposed_interest_rate: 3.5,
    application_date: '2024-01-08',
    applicant_info: {
      document: '456.789.123-45',
      monthly_income: 12000,
      company_name: 'Transportes XYZ Ltda'
    },
    risk_analysis: {
      score: 0.35,
      risk_level: 'high',
      factors: {
        income_verification: 0.6,
        credit_history: 0.3,
        debt_to_income: 0.2,
        employment_stability: 0.5,
        collateral_value: 0.4,
        positive: [
          'Setor em crescimento',
          'Experiência no ramo'
        ],
        negative: [
          'Histórico de inadimplência',
          'Alto endividamento atual',
          'Renda insuficiente para valor solicitado',
          'Setor de alto risco',
          'Falta de garantias adequadas'
        ]
      },
      recommendations: [
        'Rejeição recomendada',
        'Sugerir valor máximo de R$ 30.000',
        'Necessário melhorar score de crédito'
      ]
    },
    approval_details: {
      approved: false,
      approved_amount: 0,
      final_interest_rate: 0,
      approval_date: '2024-01-09',
      approved_by: 'analista_002',
      comments: 'Perfil de risco muito alto. Histórico de inadimplência e endividamento elevado não permitem aprovação.',
      conditions: []
    }
  }
]

// Funções para manipular aplicações de empréstimo
export const getLoanApplicationById = (id: number): LoanApplication | undefined => {
  return mockLoanApplications.find(app => app.id === id)
}

export const updateLoanApplication = (updatedApplication: LoanApplication): void => {
  const index = mockLoanApplications.findIndex(app => app.id === updatedApplication.id)
  if (index !== -1) {
    mockLoanApplications[index] = updatedApplication
  }
}

export const getLoanApplicationsByUserId = (userId: number): LoanApplication[] => {
  return mockLoanApplications.filter(app => app.user_id === userId)
}

// Dados mock para distribuições de receita
export const mockDistributions: Distribution[] = [
  {
    id: 1,
    loan_id: 1,
    payment_id: 101,
    total_amount: 5000,
    platform_fee: 250,
    security_reserve: 100,
    investor_amount: 4650,
    distribution_date: '2024-01-15',
    status: 'completed'
  },
  {
    id: 2,
    loan_id: 2,
    payment_id: 102,
    total_amount: 3200,
    platform_fee: 160,
    security_reserve: 64,
    investor_amount: 2976,
    distribution_date: '2024-01-20',
    status: 'pending'
  },
  {
    id: 3,
    loan_id: 1,
    payment_id: 103,
    total_amount: 5000,
    platform_fee: 250,
    security_reserve: 100,
    investor_amount: 4650,
    distribution_date: '2024-02-15',
    status: 'pending'
  }
]

// Dados mock para eventos de risco/fraude
export const mockRiskEvents: RiskEvent[] = [
  {
    id: 1,
    user_id: 3,
    event_type: 'suspicious_login',
    severity: 'medium',
    description: 'Login de localização incomum detectado',
    metadata: {
      ip_address: '192.168.1.100',
      location: 'São Paulo, SP',
      previous_location: 'Rio de Janeiro, RJ',
      time_difference: '2 horas'
    },
    status: 'investigating',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    user_id: 2,
    event_type: 'unusual_transaction',
    severity: 'high',
    description: 'Transação de valor alto fora do padrão do usuário',
    metadata: {
      transaction_amount: 50000,
      average_transaction: 5000,
      transaction_type: 'withdraw',
      risk_score: 0.85
    },
    status: 'open',
    created_at: '2024-01-16T14:20:00Z'
  },
  {
    id: 3,
    user_id: 1,
    event_type: 'velocity_alert',
    severity: 'low',
    description: 'Múltiplas transações em curto período',
    metadata: {
      transaction_count: 5,
      time_window: '10 minutos',
      total_amount: 15000
    },
    status: 'resolved',
    created_at: '2024-01-14T09:15:00Z',
    resolved_at: '2024-01-14T10:00:00Z'
  },
  {
    id: 4,
    user_id: 4,
    event_type: 'device_change',
    severity: 'medium',
    description: 'Acesso de novo dispositivo sem verificação',
    metadata: {
      device_type: 'mobile',
      operating_system: 'Android 12',
      browser: 'Chrome Mobile',
      first_seen: '2024-01-16T20:00:00Z'
    },
    status: 'open',
    created_at: '2024-01-16T20:05:00Z'
  }
]

// Funções para manipular distribuições
export const getDistributions = (): Distribution[] => {
  return mockDistributions
}

export const getDistributionsByLoanId = (loanId: number): Distribution[] => {
  return mockDistributions.filter(dist => dist.loan_id === loanId)
}

export const updateDistributionStatus = (id: number, status: string): void => {
  const distribution = mockDistributions.find(dist => dist.id === id)
  if (distribution) {
    distribution.status = status as 'pending' | 'completed' | 'failed'
  }
}

// Funções para manipular eventos de risco
export const getRiskEvents = (): RiskEvent[] => {
  return mockRiskEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export const getRiskEventsByUserId = (userId: number): RiskEvent[] => {
  return mockRiskEvents.filter(event => event.user_id === userId)
}

export const updateRiskEventStatus = (id: number, status: string): void => {
  const event = mockRiskEvents.find(e => e.id === id)
  if (event) {
    event.status = status as 'open' | 'investigating' | 'resolved' | 'false_positive'
    if (status === 'resolved' || status === 'false_positive') {
      event.resolved_at = new Date().toISOString()
    }
  }
}