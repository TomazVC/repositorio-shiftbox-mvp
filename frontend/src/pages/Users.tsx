import { useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import { useRetry, useAsyncOperation } from '../hooks/useRetry'
import { useFormValidation, validators } from '../hooks/useFormValidation'
import { ToastContainer } from '../components/Toast'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Select from '../components/Select'
import Input from '../components/Input'
import ErrorBoundary, { ApiErrorFallback } from '../components/ErrorBoundary'
import { TableSkeleton } from '../components/Skeletons'
import FileUpload from '../components/FileUpload'
import { User, mockUsers } from '../data/mockData'
import Icon from '../components/Icon'

function UsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [uploadingUserId, setUploadingUserId] = useState<number | null>(null)
  const [selectedUserForHash, setSelectedUserForHash] = useState<User | null>(null)
  
  const { toasts, removeToast, success, error, loading: toastLoading } = useToast()
  const { execute: executeCreate, isLoading: createLoading } = useAsyncOperation<User>()
  const { execute: executeDelete, isLoading: deleteLoading } = useAsyncOperation<void>()
  
  // Form validation for create user
  const {
    values: createForm,
    errors: createFormErrors,
    touched: createFormTouched,
    setValue: setCreateFormValue,
    setFieldTouched: setCreateFormFieldTouched,
    validateForm: validateCreateForm,
    resetForm: resetCreateForm
  } = useFormValidation(
    {
      name: '',
      email: '',
      saldo: '',
      kyc_status: 'pending' as 'pending' | 'approved' | 'rejected'
    },
    {
      name: { 
        required: true, 
        minLength: 2,
        message: 'Nome deve ter pelo menos 2 caracteres'
      },
      email: { 
        required: true, 
        custom: validators.email,
        message: 'E-mail é obrigatório'
      },
      saldo: { 
        required: true, 
        custom: validators.positiveNumber,
        message: 'Saldo deve ser um valor positivo'
      }
    }
  )
  
  const { 
    execute: loadUsers, 
    retry: retryLoadUsers, 
    isLoading: loading, 
    error: loadError 
  } = useRetry(async () => {
    // TODO: Substituir por chamada real à API quando backend estiver pronto
    // return await api.get('/users')
    
    // Mock para desenvolvimento
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockUsers
  }, {
    maxRetries: 3,
    retryDelay: 2000,
    onError: () => error('Erro ao carregar usuários. Tentando novamente...')
  })

  useEffect(() => {
    loadUsers().then(data => {
      if (data) setUsers(data)
    }).catch(() => {
      // Error já tratado pelo hook useRetry
    })
  }, [])

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

  const handleSaveUser = async (updatedStatus: string) => {
    if (!editingUser) return

    const loadingToast = toastLoading('Atualizando status KYC...')

    try {
      // TODO: Integrar com API real
      // await api.put(`/users/${editingUser.id}`, { kyc_status: updatedStatus })

      // Simulação local
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id ? { ...u, kyc_status: updatedStatus as any } : u
        )
      )

      loadingToast.success('Status KYC atualizado com sucesso!')
      setEditingUser(null)
    } catch (err) {
      loadingToast.error('Erro ao atualizar status KYC')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await executeDelete(async () => {
        // TODO: Integrar com API real
        // await api.delete(`/users/${userId}`)
        
        // Simulação local
        await new Promise(resolve => setTimeout(resolve, 1500))
      })

      setUsers(prev => prev.filter(u => u.id !== userId))
      success('Usuário excluído com sucesso!')
      setDeletingUserId(null)
    } catch (err) {
      error('Erro ao excluir usuário. Tente novamente.')
    }
  }

  const handleCreateUser = async () => {
    if (!validateCreateForm()) {
      error('Preencha todos os campos corretamente')
      return
    }

    try {
      const newUser = await executeCreate(async () => {
        // TODO: Integrar com API real
        // return await api.post('/users', createForm)
        
        // Simulação local
        await new Promise(resolve => setTimeout(resolve, 1200))
        
        return {
          id: Math.max(...users.map(u => u.id)) + 1,
          name: createForm.name,
          email: createForm.email,
          kyc_status: createForm.kyc_status,
          saldo: parseFloat(createForm.saldo),
          created_at: new Date().toISOString()
        }
      })

      setUsers(prev => [...prev, newUser])
      success('Usuário criado com sucesso!')
      setIsCreateModalOpen(false)
      resetCreateForm()
    } catch (err) {
      error('Erro ao criar usuário. Verifique os dados e tente novamente.')
    }
  }

  const handleKycUpload = async (_files: File[]) => {
    if (!uploadingUserId) return
    
    const loadingToast = toastLoading('Enviando documentos KYC...')
    
    try {
      // TODO: Integrar com API real
      // const formData = new FormData()
      // files.forEach(file => formData.append('documents', file))
      // await api.post(`/users/${uploadingUserId}/documents`, formData)
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      loadingToast.success('Documentos KYC enviados com sucesso!')
      setUploadingUserId(null)
    } catch (err) {
      loadingToast.error('Erro ao enviar documentos KYC')
    }
  }

  if (loading) {
    return <TableSkeleton />
  }

  if (loadError) {
    return (
      <ApiErrorFallback 
        error={loadError} 
        onRetry={retryLoadUsers}
        showDetails
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Modal de Upload KYC */}
      {uploadingUserId && (
        <Modal
          isOpen={!!uploadingUserId}
          onClose={() => setUploadingUserId(null)}
          title="Upload de Documentos KYC"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Faça upload dos documentos KYC para o usuário selecionado.
            </p>
            
            <FileUpload
              label="Documentos KYC"
              onFileSelect={(file) => handleKycUpload([file])}
              accept="image/*,.pdf"
              maxSize={10}
              hint="Envie documentos em PDF ou imagem (máx. 10MB)"
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setUploadingUserId(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Hash de Segurança */}
      {selectedUserForHash && (
        <Modal
          isOpen={!!selectedUserForHash}
          onClose={() => setSelectedUserForHash(null)}
          title="Hash de Segurança do Usuário"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-caption mb-1" style={{ color: 'var(--text-secondary)' }}>Usuário</p>
              <p className="text-h2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selectedUserForHash.name}
              </p>
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                {selectedUserForHash.email}
              </p>
            </div>

            <div>
              <p className="text-caption mb-2" style={{ color: 'var(--text-secondary)' }}>
                Hash de Segurança
              </p>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <code className="text-sm font-mono break-all" style={{ color: 'var(--text-primary)' }}>
                  {selectedUserForHash.hash || 'Hash não disponível'}
                </code>
              </div>
              <p className="text-caption mt-2" style={{ color: 'var(--text-secondary)' }}>
                Este hash é utilizado para verificação de segurança e integridade dos dados do usuário.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(selectedUserForHash.hash || '')
                  success('Hash copiado para a área de transferência!')
                }}
              >
                <Icon name="copy" size={14} />
                Copiar Hash
              </Button>
              <Button
                variant="primary"
                onClick={() => setSelectedUserForHash(null)}
              >
                <Icon name="x" size={14} />
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
            onChange={(e) => setCreateFormValue('name', e.target.value)}
            onBlur={() => setCreateFormFieldTouched('name')}
            error={createFormTouched.name ? createFormErrors.name : undefined}
          />

          <Input
            label="Email"
            type="email"
            placeholder="usuario@email.com"
            value={createForm.email}
            onChange={(e) => setCreateFormValue('email', e.target.value)}
            onBlur={() => setCreateFormFieldTouched('email')}
            error={createFormTouched.email ? createFormErrors.email : undefined}
          />

          <Input
            label="Saldo Inicial"
            type="number"
            placeholder="0.00"
            hint="Valor em reais (R$)"
            value={createForm.saldo}
            onChange={(e) => setCreateFormValue('saldo', e.target.value)}
            onBlur={() => setCreateFormFieldTouched('saldo')}
            error={createFormTouched.saldo ? createFormErrors.saldo : undefined}
          />

          <Select
            label="Status KYC"
            value={createForm.kyc_status}
            onChange={(e) => setCreateFormValue('kyc_status', e.target.value as 'pending' | 'approved' | 'rejected')}
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
        loading={deleteLoading}
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
          <Icon name="plus" size={16} />
          Novo Usuário
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
              <th>Hash Segurança</th>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUserForHash(user)}
                  >
                    <Icon name="eye" size={14} />
                    Ver Hash
                  </Button>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Icon name="edit" size={14} />
                      Editar KYC
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadingUserId(user.id)}
                    >
                      <Icon name="upload" size={14} />
                      Upload KYC
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingUserId(user.id)}
                      disabled={deleteLoading}
                    >
                      <Icon name="trash" size={14} />
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

export default function Users() {
  return (
    <ErrorBoundary showDetails>
      <UsersContent />
    </ErrorBoundary>
  )
}
