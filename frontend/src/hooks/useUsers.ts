import { useState, useEffect, useCallback } from 'react'
import { userService, FrontendUser } from '../services/userService'
import { useToast } from './useToast'

export const useUsers = () => {
  const [users, setUsers] = useState<FrontendUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: errorToast } = useToast()

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const usersData = await userService.getAllUsers()
      setUsers(usersData)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar usuários'
      setError(errorMessage)
      errorToast(`Erro: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [errorToast])

  const createUser = async (userData: {
    email: string
    name?: string
    cpf?: string
    phone?: string
  }) => {
    try {
      const newUser = await userService.createUser(userData)
      setUsers(prev => [newUser, ...prev])
      
      success(`Usuário ${newUser.name} criado com sucesso`)
      return newUser
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar usuário'
      errorToast(`Erro: ${errorMessage}`)
      throw err
    }
  }

  const updateUser = async (id: number, userData: Partial<{
    name: string
    email: string
    cpf: string
    phone: string
    birth_date: string
    address: string
  }>) => {
    try {
      const updatedUser = await userService.updateUser(id, userData)
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ))
      
      success(`Usuário ${updatedUser.name} atualizado com sucesso`)
      return updatedUser
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar usuário'
      errorToast(`Erro: ${errorMessage}`)
      throw err
    }
  }

  const updateUserKycStatus = async (id: number, status: 'approved' | 'rejected', comments?: string) => {
    try {
      const updatedUser = await userService.updateUserKycStatus(id, status, comments)
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ))
      
      const statusText = userService.getStatusText(status)
      success(`KYC do usuário ${updatedUser.name} foi ${statusText.toLowerCase()}`)
      return updatedUser
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar status KYC'
      errorToast(`Erro: ${errorMessage}`)
      throw err
    }
  }

  const uploadKycDocuments = async (userId: number, files: File[]) => {
    try {
      const result = await userService.uploadKycDocuments(userId, files)
      if (result.success) {
        success(result.message)
        // Recarregar usuário para verificar se status mudou
        const user = users.find(u => u.id === userId)
        if (user) {
          // Em implementação real, recarregaria o usuário específico
          success(`Documentos enviados para ${user.name}`)
        }
      }
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao enviar documentos'
      errorToast(`Erro: ${errorMessage}`)
      throw err
    }
  }

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  return {
    users,
    isLoading,
    error,
    loadUsers,
    createUser,
    updateUser,
    updateUserKycStatus,
    uploadKycDocuments
  }
}

export const useUser = (userId: number) => {
  const [user, setUser] = useState<FrontendUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: errorToast } = useToast()

  const loadUser = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)
    
    try {
      const userData = await userService.getUserById(userId)
      setUser(userData)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar usuário'
      setError(errorMessage)
      errorToast(`Erro: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [userId, errorToast])

  const updateUserKycStatus = async (status: 'approved' | 'rejected', comments?: string) => {
    if (!user) return null

    try {
      const updatedUser = await userService.updateUserKycStatus(user.id, status, comments)
      setUser(updatedUser)
      
      const statusText = userService.getStatusText(status)
      success(`KYC do usuário ${updatedUser.name} foi ${statusText.toLowerCase()}`)
      return updatedUser
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar status KYC'
      errorToast(`Erro: ${errorMessage}`)
      throw err
    }
  }

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return {
    user,
    isLoading,
    error,
    loadUser,
    updateUserKycStatus
  }
}