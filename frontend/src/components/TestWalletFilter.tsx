import { useState } from 'react'
import { mockUsers, User } from '../data/mockData'
import Icon from '../components/Icon'

// Componente de teste simples
const TestWalletFilter = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const filteredUsers = mockUsers // Usar diretamente sem estado

  console.log('TestWalletFilter - mockUsers:', mockUsers.length)
  console.log('TestWalletFilter - filteredUsers:', filteredUsers.length)
  console.log('TestWalletFilter - selectedUser:', selectedUser)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Teste - Filtro de Carteiras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Usuários ({filteredUsers.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div 
                key={user.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {user.saldo.toLocaleString('pt-BR')}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.kyc_status === 'approved' ? 'bg-green-100 text-green-700' :
                      user.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.kyc_status === 'approved' ? 'Aprovado' :
                       user.kyc_status === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área de Exibição */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">
            {selectedUser ? `Carteira - ${selectedUser.name}` : 'Selecione um usuário'}
          </h2>
          
          {selectedUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-medium">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  R$ {selectedUser.saldo.toLocaleString('pt-BR')}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 border rounded">
                  <Icon name="wallet" className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Disponível</p>
                  <p className="font-semibold">R$ {selectedUser.saldo.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-3 border rounded">
                  <Icon name="lock" className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                  <p className="text-sm text-gray-600">Bloqueado</p>
                  <p className="font-semibold">R$ 0,00</p>
                </div>
                <div className="p-3 border rounded">
                  <Icon name="chart-bar" className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold">R$ {selectedUser.saldo.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Clique em um usuário para ver sua carteira</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestWalletFilter