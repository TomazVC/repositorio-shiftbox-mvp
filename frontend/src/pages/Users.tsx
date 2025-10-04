import { useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Select from '../components/Select'
import Input from '../components/Input'

interface User {
  id: number
  name: string
  email: string
  kyc_status: 'pending' | 'approved' | 'rejected'
  saldo: number
  created_at: string
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    saldo: '',
    kyc_status: 'pending' as 'pending' | 'approved' | 'rejected'
  })
  const [createLoading, setCreateLoading] = useState(false)
  const { toasts, removeToast, success } = useToast()

  // Mock data por enquanto (será substituído por API real)
  const mockUsers: User[] = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', kyc_status: 'approved', saldo: 15000, created_at: '2025-01-15' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', kyc_status: 'pending', saldo: 28000, created_at: '2025-01-16' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', kyc_status: 'approved', saldo: 42000, created_at: '2025-01-14' },
    { id: 4, name: 'Ana Oliveira', email: 'ana@email.com', kyc_status: 'rejected', saldo: 0, created_at: '2025-01-17' },
  ]

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      // TODO: Substituir por chamada real à API quando backend estiver pronto
      // const response = await get('/users')
      // setUsers(response.data)
      
      // Por enquanto, usando mock
      setTimeout(() => {
        setUsers(mockUsers)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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

  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const handleSaveUser = (updatedStatus: string) => {
    if (!editingUser) return

    // TODO: Integrar com API real
    // await put(`/users/${editingUser.id}`, { kyc_status: updatedStatus })

    // Atualizar localmente
    setUsers(prev =>
      prev.map(u =>
        u.id === editingUser.id ? { ...u, kyc_status: updatedStatus as any } : u
      )
    )

    success('Status KYC atualizado com sucesso!')
    setEditingUser(null)
  }

  const handleDeleteUser = (userId: number) => {
    // TODO: Integrar com API real
    // await delete(`/users/${userId}`)

    setUsers(prev => prev.filter(u => u.id !== userId))
    success('Usuário excluído com sucesso!')
    setDeletingUserId(null)
  }

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.saldo) {
      return
    }

    setCreateLoading(true)

    try {
      // TODO: Integrar com API real
      // await post('/users', createForm)
      
      // Simulação local
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        name: createForm.name,
        email: createForm.email,
        kyc_status: createForm.kyc_status,
        saldo: parseFloat(createForm.saldo),
        created_at: new Date().toISOString()
      }

      setUsers(prev => [...prev, newUser])
      success('Usuário criado com sucesso!')
      setIsCreateModalOpen(false)
      setCreateForm({
        name: '',
        email: '',
        saldo: '',
        kyc_status: 'pending'
      })
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
    } finally {
      setCreateLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="skeleton h-8 w-64 mx-auto mb-4"></div>
        <div className="skeleton h-4 w-96 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Modal de Edição */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title="Editar Status KYC"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <p className="text-caption mb-1" style={{ color: 'var(--text-secondary)' }}>Usuário</p>
              <p className="text-h2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingUser.name}
              </p>
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                {editingUser.email}
              </p>
            </div>

            <Select
              label="Status KYC"
              defaultValue={editingUser.kyc_status}
              onChange={(e) => handleSaveUser(e.target.value)}
            >
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
            </Select>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setEditingUser(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Criação */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Usuário"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nome Completo"
            placeholder="Digite o nome completo"
            value={createForm.name}
            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
          />

          <Input
            label="Email"
            type="email"
            placeholder="usuario@email.com"
            value={createForm.email}
            onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
          />

          <Input
            label="Saldo Inicial"
            type="number"
            placeholder="0.00"
            hint="Valor em reais (R$)"
            value={createForm.saldo}
            onChange={(e) => setCreateForm(prev => ({ ...prev, saldo: e.target.value }))}
          />

          <Select
            label="Status KYC"
            value={createForm.kyc_status}
            onChange={(e) => setCreateForm(prev => ({ 
              ...prev, 
              kyc_status: e.target.value as 'pending' | 'approved' | 'rejected' 
            }))}
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </Select>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateUser}
              loading={createLoading}
            >
              Criar Usuário
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dialog de Confirmação */}
      <ConfirmDialog
        isOpen={deletingUserId !== null}
        onClose={() => setDeletingUserId(null)}
        onConfirm={() => deletingUserId && handleDeleteUser(deletingUserId)}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Gerenciamento de Usuários
          </h2>
          <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
            Total: {users.length} usuários cadastrados
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Novo Usuário
        </Button>
      </div>

      {/* Tabela */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th>KYC Status</th>
              <th>Saldo</th>
              <th>Data Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {user.email}
                </td>
                <td>
                  {getStatusBadge(user.kyc_status)}
                </td>
                <td className="font-semibold">
                  {formatCurrency(user.saldo)}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingUserId(user.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
