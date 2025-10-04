// Tipos globais do aplicativo

// Tipos de navegação
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Invest: undefined;
  LoanRequest: undefined;
  Transactions: undefined;
};

// Tipos de API
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

// Tipos de usuário
export interface User {
  id: number;
  email: string;
  name?: string;
  role?: 'user' | 'admin';
}

// Tipos de carteira
export interface Wallet {
  id: number;
  user_id: number;
  saldo: number;
  created_at: string;
  updated_at: string;
}

// Tipos de transação
export interface Transaction {
  id: number;
  wallet_id: number;
  type: 'deposit' | 'withdraw' | 'investment' | 'loan' | 'return';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

// Tipos de investimento
export interface Investment {
  id: number;
  user_id: number;
  amount: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Tipos de empréstimo
export interface Loan {
  id: number;
  user_id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  created_at: string;
  updated_at: string;
}

// Tipos de pool
export interface PoolStatus {
  saldo_total: number;
  saldo_disponivel: number;
  saldo_emprestado: number;
  percentual_utilizacao: number;
  total_investidores: number;
}
