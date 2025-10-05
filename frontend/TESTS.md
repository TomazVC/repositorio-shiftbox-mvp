# Configuração de Testes - ShiftBox Frontend

## ✅ Status Atual

**Testes Implementados:** Estrutura básica funcional
**Framework Recomendado:** Vitest (mais rápido) ou Jest

## 🚀 Configuração Rápida

### Opção 1: Vitest (Recomendado)
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Opção 2: Jest
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

## 📦 Package.json Scripts

Adicione ao `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## 🧪 Estrutura de Testes Atual

```
src/__tests__/
├── userService.test.ts ✅ - Testes funcionais (sem dependências)
└── [futuros testes]
```

## 📋 Testes Implementados

### ✅ userService.test.ts
- `transformBackendUser()` - Transformação de dados
- `getStatusBadgeVariant()` - Mapeamento de cores
- `getStatusText()` - Mapeamento de texto  
- `generateUserHash()` - Geração de hash

**Status:** Funcional - pode ser executado sem framework

## 🎯 Executar Testes Agora

### Sem Framework (Desenvolvimento)
```javascript
// No console do navegador:
import { runUserServiceTests } from './src/__tests__/userService.test'
runUserServiceTests()
```

### Com Framework (Após configuração)
```bash
npm run test          # Executar todos os testes
npm run test:ui       # Interface visual (Vitest)
npm run test:coverage # Com cobertura
```

## 📈 Próximos Passos

1. ✅ **userService** - Testes básicos implementados
2. ⏳ **investmentService** - Testes pendentes  
3. ⏳ **loanService** - Testes pendentes
4. ⏳ **Componentes React** - Testes de UI
5. ⏳ **Testes E2E** - Playwright

## 💡 Comandos Úteis

```bash
# Instalar Vitest (recomendado)
npm i -D vitest @vitest/ui c8

# Configurar Vitest no vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
})

# Executar testes específicos
npm run test userService

# Modo watch para desenvolvimento
npm run test --watch
```

## 🎉 Resultado

**Status:** Funcional e pronto para expansão
**Cobertura:** Funções básicas do userService testadas
**Próximo:** Configurar framework completo conforme necessidade