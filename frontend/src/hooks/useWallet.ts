import { useState, useEffect } from 'react'
import { walletService, FrontendWallet, FrontendTransaction } from '../services/walletService'

// Simple toast notification function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${message}`)
  // Aqui poderia ser integrado com a biblioteca de toast preferida
}

export const useWallet = (userId: number) => {
  const [wallet, setWallet] = useState<FrontendWallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallet = async () => {
    try {
      setLoading(true)
      setError(null)
      const walletData = await walletService.getUserWallet(userId)
      setWallet(walletData)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar carteira')
      console.error('Error fetching wallet:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateBalance = async (newBalance: number) => {
    if (!wallet) return false

    try {
      setLoading(true)
      const updatedWallet = await walletService.updateWalletBalance(wallet.id, newBalance)
      setWallet(updatedWallet)
      showToast('Saldo atualizado com sucesso!', 'success')
      return true
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar saldo'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  const processDeposit = async (amount: number, pixKey?: string) => {
    try {
      setLoading(true)
      const transaction = await walletService.processDeposit(userId, amount, pixKey)
      
      // Atualizar carteira após depósito
      await fetchWallet()
      
      showToast(`Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`, 'success')
      return transaction
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao processar depósito'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return null
    } finally {
      setLoading(false)
    }
  }

  const processWithdraw = async (amount: number, pixKey: string) => {
    try {
      setLoading(true)
      const transaction = await walletService.processWithdraw(userId, amount, pixKey)
      
      // Atualizar carteira após saque
      await fetchWallet()
      
      showToast(`Saque de R$ ${amount.toFixed(2)} realizado com sucesso!`, 'success')
      return transaction
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao processar saque'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchWallet()
    }
  }, [userId])

  return {
    wallet,
    loading,
    error,
    refetch: fetchWallet,
    updateBalance,
    processDeposit,
    processWithdraw
  }
}

export const useTransactions = (userId?: number, walletId?: number) => {
  const [transactions, setTransactions] = useState<FrontendTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let transactionData: FrontendTransaction[]
      
      if (userId) {
        transactionData = await walletService.getUserTransactions(userId)
      } else if (walletId) {
        transactionData = await walletService.getWalletTransactions(walletId)
      } else {
        transactionData = await walletService.getAllTransactions()
      }
      
      setTransactions(transactionData)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar transações')
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transactionData: {
    wallet_id: number
    tipo: string
    valor: number
    descricao: string
    related_investment_id?: number
    related_loan_id?: number
  }) => {
    try {
      setLoading(true)
      const newTransaction = await walletService.createTransaction(transactionData)
      
      // Atualizar lista de transações
      await fetchTransactions()
      
      showToast('Transação criada com sucesso!', 'success')
      return newTransaction
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar transação'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getTransactionById = async (transactionId: number) => {
    try {
      const transaction = await walletService.getTransactionById(transactionId)
      return transaction
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao buscar transação'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return null
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [userId, walletId])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    getTransactionById
  }
}