import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import Select from './Select'
import Icon from './Icon'
import { formatCurrency } from '../utils/format'
import { Wallet } from '../types/wallet'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  wallet: Wallet
  onSuccess: () => void
}

const WithdrawModal = ({ isOpen, onClose, wallet, onSuccess }: WithdrawModalProps) => {
  const [amount, setAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState('cpf')
  const [step, setStep] = useState<'form' | 'queue' | 'confirmation'>('form')
  const [isLoading, setIsLoading] = useState(false)

  // Simular pool de liquidez (80% seria o limite para fila)
  const poolLiquidity = 0.75 // 75%
  const isPoolLow = poolLiquidity > 0.80
  const requestedAmount = parseFloat(amount) || 0
  const willEnterQueue = isPoolLow || requestedAmount > wallet.available_balance * 0.1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !pixKey || parseFloat(amount) <= 0) return

    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      if (willEnterQueue) {
        setStep('queue')
      } else {
        setStep('confirmation')
        // Simular processamento imediato
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 2000)
      }
    }, 1500)
  }

  const handleClose = () => {
    setAmount('')
    setPixKey('')
    setPixKeyType('cpf')
    setStep('form')
    setIsLoading(false)
    onClose()
  }

  const formatAmountValue = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const cents = parseInt(numbers) || 0
    return (cents / 100).toFixed(2)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmountValue(e.target.value)
    setAmount(formatted)
  }

  const validatePixKey = (key: string, type: string): boolean => {
    switch (type) {
      case 'cpf':
        return /^\d{11}$/.test(key.replace(/\D/g, ''))
      case 'cnpj':
        return /^\d{14}$/.test(key.replace(/\D/g, ''))
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)
      case 'phone':
        return /^\d{10,11}$/.test(key.replace(/\D/g, ''))
      case 'random':
        return key.length >= 32
      default:
        return false
    }
  }

  const isValidForm = () => {
    const amountNum = parseFloat(amount)
    return amountNum > 0 && 
           amountNum <= wallet.available_balance && 
           pixKey.trim() !== '' && 
           validatePixKey(pixKey, pixKeyType)
  }

  const getQueuePosition = () => Math.floor(Math.random() * 5) + 1
  const getEstimatedTime = () => {
    const hours = Math.floor(Math.random() * 48) + 1
    return `${hours}h`
  }

  const getStepTitle = () => {
    switch (step) {
      case 'form': return 'Realizar Saque'
      case 'queue': return 'Saque na Fila'
      case 'confirmation': return 'Saque Processado'
      default: return 'Saque'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getStepTitle()}>
      <div className="space-y-6">
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Saque
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <Input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Valor mínimo: R$ 10,00</span>
                <span>Disponível: {formatCurrency(wallet.available_balance)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Chave PIX
              </label>
              <Select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value)}
                required
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave Aleatória</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave PIX
              </label>
              <Input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder={
                  pixKeyType === 'cpf' ? '000.000.000-00' :
                  pixKeyType === 'cnpj' ? '00.000.000/0000-00' :
                  pixKeyType === 'email' ? 'seu@email.com' :
                  pixKeyType === 'phone' ? '(11) 99999-9999' :
                  'Chave aleatória de 32 caracteres'
                }
                required
              />
              {pixKey && !validatePixKey(pixKey, pixKeyType) && (
                <p className="text-xs text-red-600 mt-1">
                  Chave PIX inválida para o tipo selecionado
                </p>
              )}
            </div>

            {/* Aviso sobre fila */}
            {willEnterQueue && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="clock" className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-900 font-medium">Saque será processado em fila</p>
                    <p className="text-amber-800 mt-1">
                      {isPoolLow ? 
                        'Pool com baixa liquidez. Saque será processado quando houver recursos disponíveis.' :
                        'Valor alto detectado. Saque será processado em fila de segurança.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Informações sobre liquidez */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-900 font-medium">Liquidez do Pool</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-blue-800 mb-1">
                      <span>Disponibilidade:</span>
                      <span>{Math.round((1 - poolLiquidity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(1 - poolLiquidity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValidForm() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Icon name="clock" className="w-4 h-4 animate-spin" />
                    Processando...
                  </div>
                ) : (
                  'Confirmar Saque'
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'queue' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="clock" className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Saque Adicionado à Fila
              </h3>
              <p className="text-gray-600">
                {formatCurrency(parseFloat(amount))} será processado em breve
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Posição na fila:</span>
                <span className="font-medium text-gray-900">#{getQueuePosition()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tempo estimado:</span>
                <span className="font-medium text-gray-900">{getEstimatedTime()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chave PIX:</span>
                <span className="font-medium text-gray-900 font-mono">{pixKey}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-900 font-medium">Como funciona a fila:</p>
                  <ul className="text-blue-800 mt-1 space-y-1">
                    <li>• Processamento automático conforme disponibilidade</li>
                    <li>• Notificação por email quando processado</li>
                    <li>• Você pode acompanhar o status na carteira</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Entendi
            </Button>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="check" className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Saque Processado!
              </h3>
              <p className="text-gray-600">
                {formatCurrency(parseFloat(amount))} foi enviado para sua chave PIX
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-800">Valor sacado:</span>
                <span className="font-medium text-green-900">
                  {formatCurrency(parseFloat(amount))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-800">Chave PIX:</span>
                <span className="font-medium text-green-900 font-mono">{pixKey}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-800">Novo saldo:</span>
                <span className="font-medium text-green-900">
                  {formatCurrency(wallet.available_balance - parseFloat(amount))}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              O valor deve aparecer em sua conta em até 1 minuto
            </p>

            <p className="text-sm text-gray-500">
              Esta janela será fechada automaticamente...
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default WithdrawModal