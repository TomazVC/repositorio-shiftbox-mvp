// Dados de teste para o Pool com valores grandes
// Para demonstrar a formatação inteligente de valores

export interface PoolTestData {
  scenario: string
  data: {
    saldo_total: number
    saldo_disponivel: number
    saldo_emprestado: number
    percentual_utilizacao: number
    total_investidores: number
  }
}

export const poolTestScenarios: PoolTestData[] = [
  {
    scenario: "Valores Normais",
    data: {
      saldo_total: 1000000,      // R$ 1.000.000,00
      saldo_disponivel: 650000,  // R$ 650.000,00
      saldo_emprestado: 350000,  // R$ 350.000,00
      percentual_utilizacao: 35,
      total_investidores: 127
    }
  },
  {
    scenario: "Valores Médios",
    data: {
      saldo_total: 25500000,     // R$ 25.500.000,00 -> R$ 25.5M
      saldo_disponivel: 8750000, // R$ 8.750.000,00 -> R$ 8.8M
      saldo_emprestado: 16750000, // R$ 16.750.000,00 -> R$ 16.8M
      percentual_utilizacao: 65.7,
      total_investidores: 543
    }
  },
  {
    scenario: "Valores Grandes",
    data: {
      saldo_total: 1250000000,    // R$ 1.250.000.000,00 -> R$ 1.3B
      saldo_disponivel: 425000000, // R$ 425.000.000,00 -> R$ 425.0M
      saldo_emprestado: 825000000, // R$ 825.000.000,00 -> R$ 825.0M
      percentual_utilizacao: 66,
      total_investidores: 12847
    }
  },
  {
    scenario: "Valores Extremos",
    data: {
      saldo_total: 15750000000,   // R$ 15.750.000.000,00 -> R$ 15.8B
      saldo_disponivel: 3250000000, // R$ 3.250.000.000,00 -> R$ 3.3B
      saldo_emprestado: 12500000000, // R$ 12.500.000.000,00 -> R$ 12.5B
      percentual_utilizacao: 79.4,
      total_investidores: 87234
    }
  }
]

// Cenário padrão para usar na aplicação
export const defaultPoolData = poolTestScenarios[0].data

// Função para simular diferentes cenários de teste
export const getPoolDataByScenario = (scenarioName: string) => {
  const scenario = poolTestScenarios.find(s => s.scenario === scenarioName)
  return scenario ? scenario.data : defaultPoolData
}

// Exportar todos os cenários para fácil acesso
export { poolTestScenarios as testScenarios }