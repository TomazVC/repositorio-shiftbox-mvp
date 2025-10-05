# Funcionalidade de Detalhes do Investidor - Módulo de Investimentos

## Resumo
Implementação de funcionalidade que permite aos administradores clicarem nos investidores da tabela para visualizar informações detalhadas e relevantes sobre cada usuário no contexto de investimentos.

## Componente Principal

### UserInvestmentDetails.tsx
**Localização:** `src/components/UserInvestmentDetails.tsx`

**Funcionalidades:**
- Modal completo com informações detalhadas do investidor
- Métricas de investimento personalizadas
- Análise de risco e performance
- Histórico completo de investimentos
- Score de crédito e classificação de risco
- Ações rápidas para novos investimentos e relatórios

## Funcionalidades Implementadas

### 1. Informações do Usuário
- **Perfil Completo**: Nome, email, avatar com inicial
- **Status KYC**: Badge colorido (Aprovado/Pendente/Rejeitado)
- **Data de Cadastro**: Tempo como membro da plataforma
- **Score de Crédito**: Pontuação e classificação de risco
- **Classificação de Risco**: Baixo/Médio/Alto baseado no score

### 2. Métricas de Investimento
- **Total Investido**: Soma de todos os investimentos do usuário
- **Investimentos Ativos**: Quantidade de investimentos em andamento
- **Rentabilidade Média**: Média ponderada dos retornos
- **Saldo Disponível**: Valor atual na carteira para novos investimentos

### 3. Análise de Risco
- **Score de Crédito**: Pontuação numérica (400-850)
- **Classificação de Risco**: 
  - 800+: Baixo Risco (verde)
  - 600-799: Risco Médio (amarelo)
  - <600: Alto Risco (vermelho)
- **Atividade Mensal**: Número de transações de investimento no último mês
- **Status KYC**: Validação da documentação

### 4. Performance do Investidor
- **Retorno Total**: Simulação de ganhos (5% do investido)
- **ROI Médio**: Return on Investment percentual
- **Último Investimento**: Data da última movimentação
- **Diversificação**: Análise baseada na quantidade de investimentos
  - 1 investimento: Baixa
  - 2-3 investimentos: Média
  - 4+ investimentos: Alta

### 5. Histórico Detalhado
- **Lista de Investimentos**: Todos os investimentos do usuário
- **Informações por Investimento**:
  - ID do investimento
  - Valor investido
  - Taxa de rentabilidade
  - Status (Ativo/Resgatado)
  - Data de criação
- **Ordenação**: Mais recentes primeiro

### 6. Interface Interativa
- **Tabela Clicável**: Hover effects e cursor pointer
- **Avatares**: Iniciais dos nomes em círculos coloridos
- **Ícone Visual**: Indicador de "olho" para mostrar que é clicável
- **Dica Visual**: Banner informativo explicando a funcionalidade

## Dados Utilizados e Calculados

### Dados Base
- Usuários do `mockUsers`
- Investimentos do `mockInvestments`
- Carteiras via `getWalletByUserId()`
- Transações via `getTransactionsByUserId()`
- Score de crédito via `getCreditScoreByUserId()`

### Cálculos Automáticos
```typescript
// Total investido
const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.valor, 0)

// Investimentos ativos
const activeInvestments = userInvestments.filter(inv => inv.status === 'ativo').length

// Retorno simulado (5% do investido)
const totalReturns = totalInvested * 0.05

// Rentabilidade média
const averageReturn = userInvestments.reduce((sum, inv) => sum + inv.rentabilidade, 0) / userInvestments.length

// Atividade mensal
const monthlyActivity = transactions.filter(t => 
  isLastMonth(t.created_at) && t.type === 'investment'
).length
```

### Classificação de Risco
```typescript
const getRiskLevel = (score: number) => {
  if (score >= 800) return { label: 'Baixo Risco', color: 'text-green-600', bg: 'bg-green-100' }
  if (score >= 600) return { label: 'Risco Médio', color: 'text-yellow-600', bg: 'bg-yellow-100' }
  return { label: 'Alto Risco', color: 'text-red-600', bg: 'bg-red-100' }
}
```

## Experiência do Usuário

### Visual
- **Cards Informativos**: Métricas organizadas em grid responsivo
- **Cores Semânticas**: Verde para positivo, vermelho para risco, azul para neutro
- **Ícones Descritivos**: Cada métrica tem ícone relacionado
- **Layout Responsivo**: Adaptável a diferentes tamanhos de tela

### Interatividade
- **Hover Effects**: Feedback visual ao passar o mouse
- **Loading States**: Skeleton loading durante carregamento
- **Error Handling**: Tratamento de erros com mensagens claras
- **Modal Responsivo**: Tamanho XL para acomodar todas as informações

### Ações Disponíveis
- **Novo Investimento**: Botão direto para criar investimento para o usuário
- **Gerar Relatório**: Funcionalidade para exportar dados (preparado para implementação)
- **Fechar Modal**: Botão claro de saída

## Benefícios para Administradores

### Análise Completa
- Visão 360° do perfil do investidor
- Métricas relevantes para tomada de decisão
- Histórico completo para análise de padrões
- Classificação de risco automatizada

### Eficiência Operacional
- Acesso rápido às informações através de um clique
- Dados consolidados em uma interface
- Ações rápidas sem navegação complexa
- Interface intuitiva e familiar

### Gestão de Risco
- Score de crédito visível
- Classificação automática de risco
- Análise de diversificação
- Monitoramento de atividade

## Integração com Sistema Existente

### Compatibilidade
- ✅ Usa dados mock existentes
- ✅ Mantém estrutura de componentes atual
- ✅ Integra com serviços de carteira
- ✅ Compatível com sistema de score de crédito

### Escalabilidade
- ✅ Preparado para APIs reais
- ✅ Estrutura modular e reutilizável
- ✅ Performance otimizada
- ✅ Fácil manutenção e extensão

## Próximos Passos Sugeridos

1. **Integração com APIs Reais**: Substituir dados mock por endpoints reais
2. **Relatórios Avançados**: Implementar geração de PDFs e exports
3. **Gráficos de Performance**: Adicionar visualizações temporais
4. **Alertas de Risco**: Sistema de notificações para mudanças de score
5. **Comparação de Investidores**: Funcionalidade para comparar múltiplos perfis
6. **Histórico de Interações**: Registro de visualizações e ações administrativas

## Código de Exemplo - Como Usar

```tsx
// Na página de investimentos
const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

// Ao clicar na linha da tabela
const handleUserClick = (userId: number) => {
  setSelectedUserId(userId)
}

// Modal de detalhes
{selectedUserId && (
  <UserInvestmentDetails
    userId={selectedUserId}
    isOpen={!!selectedUserId}
    onClose={() => setSelectedUserId(null)}
  />
)}
```

A implementação está completa e pronta para uso, proporcionando uma experiência rica e informativa para administradores que precisam analisar o perfil e comportamento dos investidores na plataforma.