// Constantes do aplicativo

// Valores monetários
export const CURRENCY = {
  SYMBOL: 'R$',
  LOCALE: 'pt-BR',
  MIN_INVESTMENT: 100,
  MAX_INVESTMENT: 100000,
  MIN_LOAN: 500,
  MAX_LOAN: 50000,
} as const;

// Status de transações
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Tipos de transações
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  INVESTMENT: 'investment',
  LOAN: 'loan',
  RETURN: 'return',
} as const;

// Status de investimentos
export const INVESTMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Status de empréstimos
export const LOAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
} as const;

// Paleta de cores ShiftBox - Design System
export const COLORS = {
  // Primária
  PRIMARY: '#04BF55', // Verde ShiftBox
  PRIMARY_CONTRAST: '#FFFFFF',
  PRIMARY_HOVER: '#03A84B', // Verde escurecido para hover/press
  
  // Neutros
  BG_SCREEN: '#FFFFFF',
  BG_CARD: '#FEFEFE',
  BG_MUTED: '#F1F1F1',
  DIVIDER: '#E4E4E4',
  TEXT_PRIMARY: '#0F172A',
  TEXT_SECONDARY: '#475569',
  
  // Feedback
  ERROR: '#EF4444', // Vermelho para erro
  WARNING: '#F59E0B', // Amarelo para atenção
  INFO: '#3B82F6', // Azul para informação/validação positiva
  SUCCESS: '#10B981', // Verde suave para sucesso
  
  // Estados
  DISABLED: '#D1D5DB',
  PLACEHOLDER: '#94A3B8',
  
  // Focus ring
  FOCUS_RING: 'rgba(4, 191, 85, 0.2)', // Verde com opacidade
} as const;

// Tamanhos de fonte - Design System
export const FONT_SIZES = {
  TITLE_MAIN: 30, // 28-32 semibold
  SUBTITLE: 22, // 20-24 medium
  BODY: 16, // 16 regular
  AUXILIARY: 13, // 12-14 medium
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  '2XL': 24,
  '3XL': 30,
  '4XL': 36,
} as const;

// Espaçamentos - Design System (4-8pt para detalhes, 16-24pt para seções)
export const SPACING = {
  XS: 4, // Pequenos detalhes
  SM: 8, // Pequenos detalhes
  BASE: 16, // Seções maiores
  LG: 24, // Seções maiores
  XL: 32,
  '2XL': 48,
} as const;

// Componentes - Design System
export const COMPONENTS = {
  // Botões
  BUTTON_HEIGHT: 48, // 48-52dp
  BUTTON_RADIUS: 24, // full/pill
  
  // Inputs
  INPUT_HEIGHT: 44, // 44-48dp
  INPUT_RADIUS: 12,
  
  // Cards
  CARD_RADIUS: 16, // Mais arredondado para mobile
  CARD_PADDING: 16, // 16-24px
  CARD_SHADOW: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  
  // Modal/Sheet
  MODAL_RADIUS: 24, // Canto superior arredondado
  
  // Área de toque mínima
  TOUCH_MIN_SIZE: 44, // 44x44dp
} as const;

// Transições e animações
export const ANIMATIONS = {
  DURATION: 200, // 150-200ms
  EASING: 'ease-in-out',
} as const;