// Dados compartilhados entre todos os módulos
// Centraliza usuários, investimentos e empréstimos para manter consistência

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