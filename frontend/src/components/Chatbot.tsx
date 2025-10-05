import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

interface Message {
  id: string
  content: string
  sender: 'user' | 'copilot'
  timestamp: Date
}



// Mock responses para demonstração
const mockResponses = {
  greeting: [
    "Olá! Sou o Copilot, seu assistente de IA para análise de usuários e empréstimos. Como posso ajudar você hoje?",
    "Oi! Estou aqui para auxiliar nas decisões sobre usuários da plataforma. O que você gostaria de analisar?"
  ],
  
  userAnalysis: [
    "Baseado nos dados do usuário, identifico uma probabilidade de 85% de pagamento. O score atual está adequado e o histórico é positivo. Recomendo aprovar o empréstimo com as condições padrão.",
    "Este usuário apresenta risco moderado (65% probabilidade de pagamento). Sugiro oferecer um plano alternativo: aumento do número de parcelas de 12 para 18 meses, reduzindo o valor mensal em 30%.",
    "Alerta: usuário com histórico irregular. Probabilidade de pagamento de apenas 35%. Recomendo: 1) Reduzir score temporariamente, 2) Oferecer empréstimo menor, ou 3) Solicitar garantias adicionais.",
    "Excelente perfil de crédito! Probabilidade de pagamento de 95%. Este usuário é candidato ideal para ofertas premium e limites maiores. Recomendo aprovação expressa."
  ],
  
  strategies: [
    "Para melhorar a taxa de pagamento, sugiro implementar: 1) Sistema de lembretes automáticos, 2) Desconto para pagamento antecipado, 3) Renegociação proativa para casos em atraso.",
    "Análise de padrões indica que usuários com score similar respondem bem a: 1) Parcelamento flexível, 2) Programa de fidelidade, 3) Consultoria financeira gratuita.",
    "Estratégia recomendada: criar plano de recuperação personalizado com parcelas menores por 6 meses, depois retomar valor original. Taxa de sucesso: 78%."
  ],
  
  defaultResponses: [
    "Posso ajudar você a analisar usuários específicos, avaliar riscos de empréstimo ou sugerir estratégias de recuperação. Sobre qual usuário você gostaria de obter insights?",
    "Estou preparado para fornecer análises detalhadas sobre perfis de crédito, probabilidades de pagamento e planos alternativos. Qual análise você precisa?",
    "Minha especialidade é auxiliar em decisões estratégicas sobre usuários da plataforma. Posso analisar scores, históricos e sugerir ações personalizadas."
  ]
}

const generateResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase()
  
  // Detecta saudações
  if (message.includes('olá') || message.includes('oi') || message.includes('hello')) {
    return mockResponses.greeting[Math.floor(Math.random() * mockResponses.greeting.length)]
  }
  
  // Detecta análise de usuário
  if (message.includes('usuário') || message.includes('user') || message.includes('analisar') || 
      message.includes('empréstimo') || message.includes('score') || message.includes('crédito')) {
    return mockResponses.userAnalysis[Math.floor(Math.random() * mockResponses.userAnalysis.length)]
  }
  
  // Detecta pedidos de estratégia
  if (message.includes('estratégia') || message.includes('sugestão') || message.includes('plano') || 
      message.includes('como') || message.includes('melhorar')) {
    return mockResponses.strategies[Math.floor(Math.random() * mockResponses.strategies.length)]
  }
  
  // Resposta padrão
  return mockResponses.defaultResponses[Math.floor(Math.random() * mockResponses.defaultResponses.length)]
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou o Copilot, seu assistente de IA para análise de usuários e empréstimos. Como posso ajudar você hoje?',
      sender: 'copilot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simula delay da IA
    setTimeout(() => {
      const copilotResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(inputValue),
        sender: 'copilot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, copilotResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // 1-3 segundos de delay
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
          style={{ 
            backgroundColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-elevated)'
          }}
        >
          <Icon name="message-circle" size={24} color="white" />
        </button>
      )}

      {/* Janela do chat */}
      {isOpen && (
        <div 
          className="w-96 h-[500px] rounded-lg shadow-2xl flex flex-col overflow-hidden"
          style={{ 
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border)'
          }}
        >
          {/* Header */}
          <div 
            className="px-4 py-3 flex items-center justify-between"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Icon name="activity" size={16} color="white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Copilot</h3>
                <p className="text-xs opacity-90">Assistente de IA</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all"
            >
              <Icon name="x" size={16} color="white" />
            </button>
          </div>

          {/* Mensagens */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: 'var(--bg-elev-1)' }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'rounded-br-none'
                        : 'rounded-bl-none'
                    }`}
                    style={{
                      backgroundColor: message.sender === 'user' 
                        ? 'var(--color-primary)' 
                        : 'var(--bg-page)',
                      color: message.sender === 'user' 
                        ? 'white' 
                        : 'var(--text-primary)',
                      border: message.sender === 'copilot' 
                        ? '1px solid var(--border)' 
                        : 'none'
                    }}
                  >
                    {message.content}
                  </div>
                  <div 
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                    style={{ color: 'var(--text-placeholder)' }}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex justify-start">
                <div 
                  className="px-3 py-2 rounded-lg rounded-bl-none border text-sm"
                  style={{ 
                    backgroundColor: 'var(--bg-page)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="ml-2">Copilot está digitando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="p-4 border-t"
            style={{ 
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg-elev-1)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                }}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                <Icon name="arrow-right" size={16} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
