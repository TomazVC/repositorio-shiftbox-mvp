// Constantes do aplicativo

// Avatar base64 padrão (pixel transparente) para registros sem upload
export const DEFAULT_AVATAR_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAuMB9pC4XPEAAAAASUVORK5CYII=' as const;

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
  DEPOSITO: 'deposito',
  SAQUE: 'saque',
  INVESTIMENTO: 'investimento',
  EMPRESTIMO_RECEBIDO: 'emprestimo_recebido',
  PAGAMENTO_EMPRESTIMO: 'pagamento_emprestimo',
  RENDIMENTO: 'rendimento',
  RESGATE_INVESTIMENTO: 'resgate_investimento',
  AJUSTE_SALDO: 'ajuste_saldo',
  CANCELAMENTO_INVESTIMENTO: 'cancelamento_investimento',
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
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  SUCCESS: '#10B981',

  // Estados
  DISABLED: '#D1D5DB',
  PLACEHOLDER: '#94A3B8',

  // Focus ring
  FOCUS_RING: 'rgba(4, 191, 85, 0.2)',
} as const;

// Tamanhos de fonte - Design System
export const FONT_SIZES = {
  TITLE_MAIN: 30,
  SUBTITLE: 22,
  BODY: 16,
  AUXILIARY: 13,
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  '2XL': 24,
  '3XL': 30,
  '4XL': 36,
} as const;

// Espaçamentos - Design System
export const SPACING = {
  XS: 4,
  SM: 8,
  BASE: 16,
  LG: 24,
  XL: 32,
  '2XL': 48,
} as const;

// Componentes - Design System
export const COMPONENTS = {
  BUTTON_HEIGHT: 48,
  BUTTON_RADIUS: 24,
  INPUT_HEIGHT: 44,
  INPUT_RADIUS: 12,
  CARD_RADIUS: 16,
  CARD_PADDING: 16,
  CARD_SHADOW: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  MODAL_RADIUS: 24,
  TOUCH_MIN_SIZE: 44,
} as const;

// Transições e animações
export const ANIMATIONS = {
  DURATION: 200,
  EASING: 'ease-in-out',
} as const;