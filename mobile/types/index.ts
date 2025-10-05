export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Dashboard: undefined;
  CreditScore: undefined;
  Invest: undefined;
  LoanRequest: undefined;
  Transactions: undefined;
  Withdraw: undefined;
  InvestmentDetails: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  CreditScore: undefined;
  Invest: undefined;
  Transactions: undefined;
};

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  cpf?: string;
  date_of_birth?: string;
  profile_image_base64?: string;
  kyc_status?: string;
  credit_score?: number | null;
  is_active?: boolean;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  saldo: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  tipo: string;
  valor: number;
  descricao?: string | null;
  related_investment_id?: number | null;
  related_loan_id?: number | null;
  created_at: string;
}

export interface Investment {
  id: number;
  user_id: number;
  valor: number;
  taxa_rendimento: number;
  rendimento_acumulado: number;
  status: string;
  created_at: string;
  updated_at: string;
  resgatado_at?: string | null;
}

export interface Loan {
  id: number;
  user_id: number;
  valor: number;
  valor_pago: number;
  taxa_juros: number;
  prazo_meses: number;
  status: string;
  motivo_rejeicao?: string | null;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  paid_at?: string | null;
}

export interface PoolStatus {
  saldo_total: number;
  saldo_disponivel: number;
  saldo_emprestado: number;
  percentual_utilizacao: number;
  total_investidores: number;
}

export interface ScoreHistoryItem {
  date: string;
  score: number;
  change: number;
}

export interface ScoreFactors {
  payment_history: number;
  credit_utilization: number;
  account_age: number;
  transaction_volume: number;
  risk_events: number;
}

export interface CreditScoreData {
  score: number;
  classification: string;
  factors: ScoreFactors;
  history: ScoreHistoryItem[];
}

export interface InvestmentDetailed {
  id: string;
  amount: number;
  shares: number;
  investment_date: string;
  status: 'ACTIVE' | 'REDEEMED' | 'PENDING';
}

export interface EarningsHistory {
  date: string;
  amount: number;
  type: 'INTEREST' | 'BONUS' | 'FEE_REFUND';
}

export interface Projection {
  period: '1M' | '3M' | '6M' | '1Y';
  estimated_return: number;
  total_amount: number;
}

export type NotificationType = 'PAYMENT' | 'INVESTMENT' | 'LOAN' | 'SCORE' | 'SYSTEM' | 'SECURITY';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    route: keyof RootStackParamList;
  };
}