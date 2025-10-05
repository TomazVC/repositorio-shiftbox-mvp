// Tipos para o sistema de carteira e transações

export interface Transaction {
  id: number
  user_id: number
  type: 'deposit' | 'withdraw' | 'investment' | 'loan_disbursement' | 'loan_payment' | 'interest_distribution'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description: string
  created_at: string
  completed_at?: string
  reference_id?: string
  metadata?: {
    pix_key?: string
    qr_code?: string
    bank_slip?: string
    loan_id?: number
    investment_id?: number
  }
}

export interface Wallet {
  id: number
  user_id: number
  available_balance: number
  blocked_balance: number
  total_balance: number
  last_updated: string
}

export interface QueueRequest {
  id: number
  user_id: number
  type: 'withdraw' | 'loan_request'
  amount: number
  status: 'queued' | 'processing' | 'completed' | 'cancelled'
  priority: number
  estimated_completion: string
  created_at: string
  position_in_queue: number
}

// Tipos para score de crédito

export interface CreditScore {
  id: number
  user_id: number
  score: number // 0-1000
  risk_level: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor'
  factors: {
    payment_history: number
    credit_utilization: number
    length_of_history: number
    types_of_credit: number
    recent_inquiries: number
  }
  explanation: string[]
  last_updated: string
  version: number
}

export interface ScoreHistory {
  id: number
  user_id: number
  score: number
  risk_level: string
  reason: string
  created_at: string
}

export interface RiskEvent {
  id: number
  user_id: number
  event_type: 'suspicious_login' | 'unusual_transaction' | 'device_change' | 'velocity_alert'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  metadata: Record<string, any>
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  created_at: string
  resolved_at?: string
}

// Tipos para distribuição de juros

export interface Distribution {
  id: number
  loan_id: number
  payment_id: number
  total_amount: number
  platform_fee: number
  security_reserve: number
  investor_amount: number
  distribution_date: string
  status: 'pending' | 'completed' | 'failed'
}

export interface InvestorReturn {
  id: number
  user_id: number
  distribution_id: number
  investment_id: number
  amount: number
  percentage: number
  created_at: string
}

// Tipos para PIX

export interface PixDeposit {
  id: string
  amount: number
  qr_code: string
  qr_code_base64: string
  expiration_date: string
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  created_at: string
}

export interface BankAccount {
  id: number
  user_id: number
  bank_code: string
  bank_name: string
  agency: string
  account: string
  account_type: 'checking' | 'savings'
  holder_name: string
  holder_document: string
  verified: boolean
  created_at: string
}

// Tipos para sistema avançado de empréstimos

export interface LoanApplication {
  id: number
  user_id: number
  requested_amount: number
  duration_months: number
  purpose: 'capital_giro' | 'expansao' | 'equipamentos' | 'marketing' | 'reforma' | 'outros'
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  proposed_interest_rate: number
  application_date: string
  applicant_info: {
    document: string
    monthly_income: number
    company_name: string
  }
  risk_analysis?: RiskAnalysis
  approval_details?: ApprovalDetails
}

export interface RiskAnalysis {
  score: number // 0-1
  risk_level: 'low' | 'medium' | 'high'
  factors: {
    income_verification: number
    credit_history: number
    debt_to_income: number
    employment_stability: number
    collateral_value: number
    positive: string[]
    negative: string[]
  }
  recommendations: string[]
}

export interface ApprovalDetails {
  approved: boolean
  approved_amount: number
  final_interest_rate: number
  approval_date: string
  approved_by: string
  comments: string
  conditions: string[]
}

export interface LoanContract {
  id: number
  loan_application_id: number
  contract_number: string
  principal_amount: number
  interest_rate: number
  duration_months: number
  monthly_payment: number
  total_amount: number
  total_interest: number
  start_date: string
  end_date: string
  payment_schedule: PaymentSchedule[]
  terms_and_conditions: string
  signed_at?: string
  signed_by_user?: boolean
  signed_by_platform?: boolean
  contract_hash: string
}

export interface PaymentSchedule {
  id: number
  loan_contract_id: number
  installment_number: number
  due_date: string
  principal_amount: number
  interest_amount: number
  total_amount: number
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid'
  paid_amount?: number
  paid_date?: string
  late_fee?: number
  payment_method?: string
  transaction_id?: string
}

export interface LoanSimulation {
  amount: number
  duration_months: number
  interest_rate: number
  monthly_payment: number
  total_amount: number
  total_interest: number
  schedule: SimulatedPayment[]
  fees: {
    origination_fee: number
    processing_fee: number
    insurance_fee: number
    total_fees: number
  }
}

export interface SimulatedPayment {
  month: number
  due_date: string
  principal: number
  interest: number
  total: number
  remaining_balance: number
}