import { useState, useEffect } from 'react'
import Button from './Button'
import Card from './Card'
import Icon from './Icon'
import Modal from './Modal'
import { formatCurrency } from '../utils/format'
import { getRiskEvents, updateRiskEventStatus } from '../data/mockData'
import { RiskEvent } from '../types/wallet'

interface FraudDetectionProps {
  userId?: number
  onEventUpdate?: (eventId: number, status: string) => void
  className?: string
}

const FraudDetection = ({ userId, onEventUpdate, className = '' }: FraudDetectionProps) => {
  const [events, setEvents] = useState<RiskEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    highSeverity: 0
  })

  useEffect(() => {
    loadEvents()
  }, [userId])

  useEffect(() => {
    calculateStats()
  }, [events])

  const loadEvents = () => {
    const allEvents = getRiskEvents()
    const filteredEvents = userId ? allEvents.filter(event => event.user_id === userId) : allEvents
    setEvents(filteredEvents)
  }

  const calculateStats = () => {
    const total = events.length
    const open = events.filter(e => e.status === 'open' || e.status === 'investigating').length
    const resolved = events.filter(e => e.status === 'resolved' || e.status === 'false_positive').length
    const highSeverity = events.filter(e => e.severity === 'high' || e.severity === 'critical').length

    setStats({ total, open, resolved, highSeverity })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100'
      case 'investigating': return 'text-amber-600 bg-amber-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'false_positive': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'suspicious_login': return 'user'
      case 'unusual_transaction': return 'dollar-sign'
      case 'device_change': return 'smartphone'
      case 'velocity_alert': return 'clock'
      default: return 'warning'
    }
  }

  const getEventTypeText = (eventType: string) => {
    switch (eventType) {
      case 'suspicious_login': return 'Login Suspeito'
      case 'unusual_transaction': return 'Transação Incomum'
      case 'device_change': return 'Mudança de Dispositivo'
      case 'velocity_alert': return 'Alerta de Velocidade'
      default: return 'Evento Desconhecido'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto'
      case 'investigating': return 'Investigando'
      case 'resolved': return 'Resolvido'
      case 'false_positive': return 'Falso Positivo'
      default: return 'Desconhecido'
    }
  }

  const filteredEvents = events.filter(event => {
    const statusMatch = filterStatus === 'all' || event.status === filterStatus
    const severityMatch = filterSeverity === 'all' || event.severity === filterSeverity
    return statusMatch && severityMatch
  })

  const handleEventAction = async (event: RiskEvent, action: string) => {
    setIsProcessing(true)
    
    try {
      // Simular processamento
      setTimeout(() => {
        updateRiskEventStatus(event.id, action)
        onEventUpdate?.(event.id, action)
        loadEvents()
        setShowDetailsModal(false)
        setIsProcessing(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      setIsProcessing(false)
    }
  }

  const showEventDetails = (event: RiskEvent) => {
    setSelectedEvent(event)
    setShowDetailsModal(true)
  }

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Icon name="shield" className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Detecção de Fraudes</h3>
              <p className="text-sm text-gray-600">Monitoramento de atividades suspeitas</p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Eventos</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Eventos Abertos</p>
                <p className="text-xl font-bold text-red-600">{stats.open}</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Resolvidos</p>
                <p className="text-xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Alta Severidade</p>
                <p className="text-xl font-bold text-red-600">{stats.highSeverity}</p>
              </div>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="open">Abertos</option>
                <option value="investigating">Investigando</option>
                <option value="resolved">Resolvidos</option>
                <option value="false_positive">Falso Positivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severidade</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          {/* Lista de Eventos */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="shield" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum evento encontrado</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${getSeverityColor(event.severity)}`}
                  onClick={() => showEventDetails(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        event.severity === 'critical' ? 'bg-red-200' :
                        event.severity === 'high' ? 'bg-red-100' :
                        event.severity === 'medium' ? 'bg-amber-100' : 'bg-green-100'
                      }`}>
                        <Icon 
                          name={getEventTypeIcon(event.event_type)} 
                          className={`w-5 h-5 ${
                            event.severity === 'critical' ? 'text-red-800' :
                            event.severity === 'high' ? 'text-red-600' :
                            event.severity === 'medium' ? 'text-amber-600' : 'text-green-600'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">
                            {getEventTypeText(event.event_type)}
                          </p>
                          <div className={`px-2 py-1 rounded text-xs font-medium uppercase ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                        <p className="text-xs text-gray-500">
                          Usuário: #{event.user_id} | {new Date(event.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </div>
                      
                      {(event.status === 'open' || event.status === 'investigating') && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventAction(event, 'investigating')
                            }}
                          >
                            Investigar
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventAction(event, 'resolved')
                            }}
                          >
                            Resolver
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Evento #${selectedEvent?.id} - ${selectedEvent ? getEventTypeText(selectedEvent.event_type) : ''}`}
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Informações Básicas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Usuário</p>
                  <p className="font-medium">#{selectedEvent.user_id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tipo</p>
                  <p className="font-medium">{getEventTypeText(selectedEvent.event_type)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Severidade</p>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium uppercase ${getSeverityColor(selectedEvent.severity)}`}>
                    {selectedEvent.severity}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                    {getStatusText(selectedEvent.status)}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">Criado em</p>
                  <p className="font-medium">{new Date(selectedEvent.created_at).toLocaleString('pt-BR')}</p>
                </div>
                {selectedEvent.resolved_at && (
                  <div>
                    <p className="text-gray-600">Resolvido em</p>
                    <p className="font-medium">{new Date(selectedEvent.resolved_at).toLocaleString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
              <p className="text-gray-700">{selectedEvent.description}</p>
            </div>

            {/* Metadados */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Detalhes Técnicos</h4>
              <div className="space-y-2">
                {Object.entries(selectedEvent.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-medium">
                      {typeof value === 'number' && key.includes('amount') ? 
                        formatCurrency(value) : 
                        String(value)
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            {(selectedEvent.status === 'open' || selectedEvent.status === 'investigating') && (
              <div className="flex gap-3">
                <Button
                  onClick={() => handleEventAction(selectedEvent, 'resolved')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Icon name="clock" className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Icon name="check" className="w-4 h-4 mr-2" />
                  )}
                  Marcar como Resolvido
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleEventAction(selectedEvent, 'false_positive')}
                  disabled={isProcessing}
                >
                  Falso Positivo
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDetailsModal(false)}
                  disabled={isProcessing}
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default FraudDetection