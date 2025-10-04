// Configurações de ambiente para o app mobile
export interface Environment {
  API_URL: string;
  APP_VERSION: string;
  ENVIRONMENT: 'development' | 'production';
  TIMEOUT: number;
}

// Configuração de desenvolvimento
const development: Environment = {
  API_URL: 'http://localhost:8000',
  APP_VERSION: '0.1.0',
  ENVIRONMENT: 'development',
  TIMEOUT: 10000, // 10 segundos
};

// Configuração de produção (para amanhã caso terminemos o projeto principal)
const production: Environment = {
  API_URL: 'https://api.shiftbox.com.br',
  APP_VERSION: '0.1.0',
  ENVIRONMENT: 'production',
  TIMEOUT: 15000, // 15 segundos
};

// Selecionar ambiente baseado no __DEV__ (React Native)
const environment: Environment = __DEV__ ? development : production;

export default environment;

// Exportar constantes específicas para facilitar uso
export const { API_URL, APP_VERSION, ENVIRONMENT, TIMEOUT } = environment;