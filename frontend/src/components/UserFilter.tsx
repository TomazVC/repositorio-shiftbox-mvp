import { useState, useEffect } from 'react'
import { mockUsers, User } from '../data/mockData'
import Select from './Select'
import Input from './Input'
import Button from './Button'
import Icon from './Icon'
import Badge from './Badge'

interface UserFilterProps {
  onUserSelect: (user: User | null) => void
  onUsersFilter: (users: User[]) => void
  selectedUser: User | null
  className?: string
}

const UserFilter = ({ onUserSelect, onUsersFilter, selectedUser, className = '' }: UserFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [minBalance, setMinBalance] = useState('')
  const [maxBalance, setMaxBalance] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Carregar usuários iniciais
  useEffect(() => {
    setFilteredUsers(mockUsers)
    onUsersFilter(mockUsers)
  }, [])

  useEffect(() => {
    let filtered = [...mockUsers]

    // Filtro por termo de busca (nome ou email)
    if (searchTerm.trim()) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por status KYC
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.kyc_status === statusFilter)
    }

    // Filtro por saldo mínimo
    if (minBalance && !isNaN(Number(minBalance))) {
      filtered = filtered.filter(user => user.saldo >= Number(minBalance))
    }

    // Filtro por saldo máximo
    if (maxBalance && !isNaN(Number(maxBalance))) {
      filtered = filtered.filter(user => user.saldo <= Number(maxBalance))
    }

    setFilteredUsers(filtered)
    onUsersFilter(filtered)
    
    // Se o usuário selecionado não está mais na lista filtrada, desmarcar
    if (selectedUser && !filtered.find(u => u.id === selectedUser.id)) {
      onUserSelect(null)
    }
  }, [searchTerm, statusFilter, minBalance, maxBalance])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setMinBalance('')
    setMaxBalance('')
    onUserSelect(null)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
    }
    const labels: Record<string, string> = {
      approved: 'Aprovado',
      pending: 'Pendente',
      rejected: 'Rejeitado',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filtrar Usuários</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Icon name="filter" className="w-4 h-4 mr-2" />
              {showAdvancedFilters ? 'Ocultar' : 'Filtros Avançados'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
            >
              <Icon name="x" className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Filtros Básicos */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Buscar por nome ou email"
              placeholder="Digite o nome ou email do usuário"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Icon name="search" className="w-4 h-4" />}
            />
            
            <Select
              label="Status KYC"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
            </Select>
          </div>

          {/* Filtros Avançados */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Filtros por Saldo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Saldo mínimo"
                  type="number"
                  placeholder="0.00"
                  value={minBalance}
                  onChange={(e) => setMinBalance(e.target.value)}
                />
                
                <Input
                  label="Saldo máximo"
                  type="number"
                  placeholder="0.00"
                  value={maxBalance}
                  onChange={(e) => setMaxBalance(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Resultado dos Filtros */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Usuários Encontrados ({filteredUsers.length})
            </h4>
            {selectedUser && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Icon name="user" className="w-4 h-4" />
                <span>Selecionado: {selectedUser.name}</span>
              </div>
            )}
          </div>

          {/* Lista de Usuários Filtrados */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum usuário encontrado com os filtros aplicados</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => onUserSelect(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{user.name}</h5>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(user.saldo)}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(user.kyc_status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        {selectedUser && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
              >
                <Icon name="eye" className="w-4 h-4 mr-2" />
                Ver Carteira
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onUserSelect(null)}
              >
                <Icon name="x" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserFilter