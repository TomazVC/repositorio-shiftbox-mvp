import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import Icon from './Icon'
import { formatCurrency } from '../utils/format'
import { Wallet } from '../types/wallet'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  wallet: Wallet
  onSuccess: () => void
}

export const DepositModal = ({ isOpen, onClose, wallet, onSuccess }: DepositModalProps) => {
  const [amount, setAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [step, setStep] = useState<'form' | 'pix' | 'confirmation'>('form')
  const [isLoading, setIsLoading] = useState(false)

  // Simular dados PIX
  const [pixData] = useState({
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    pixCode: '00020126580014BR.GOV.BCB.PIX013635c6a4e8-3a1c-4f8a-9e7c-2d8f1a3b5e9752040000530398654041.005802BR5909SHIFTBOX6009SAO PAULO61080540900062070503***6304A7B2',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return

    setIsLoading(true)
    
    // Simular criação do PIX
    setTimeout(() => {
      setIsLoading(false)
      setStep('pix')
    }, 1500)
  }

  const handleConfirmPayment = () => {
    setIsLoading(true)
    
    // Simular confirmação do pagamento
    setTimeout(() => {
      setIsLoading(false)
      setStep('confirmation')
      
      // Simular sucesso após 2 segundos
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    }, 1000)
  }

  const handleClose = () => {
    setAmount('')
    setPixKey('')
    setStep('form')
    setIsLoading(false)
    onClose()
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixData.pixCode)
    // Aqui você poderia mostrar um toast de sucesso
  }

  const formatAmountValue = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Converte para centavos
    const cents = parseInt(numbers) || 0
    
    // Converte de volta para reais
    return (cents / 100).toFixed(2)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmountValue(e.target.value)
    setAmount(formatted)
  }

  const getStepTitle = () => {
    switch (step) {
      case 'form': return 'Realizar Depósito'
      case 'pix': return 'Pagamento PIX'
      case 'confirmation': return 'Depósito Confirmado'
      default: return 'Depósito'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getStepTitle()}>
      <div className="space-y-6">
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Depósito
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
              <p className="text-xs text-gray-500 mt-1">
                Valor mínimo: R$ 10,00
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave PIX (opcional)
              </label>
              <Input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usado para rastreamento do pagamento
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-900 font-medium">Como funciona:</p>
                  <ul className="text-blue-800 mt-1 space-y-1">
                    <li>• Você receberá um QR Code para pagamento</li>
                    <li>• O valor será creditado em até 2 minutos</li>
                    <li>• Disponível 24h por dia, 7 dias por semana</li>
                  </ul>
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
                disabled={!amount || parseFloat(amount) < 10 || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Icon name="clock" className="w-4 h-4 animate-spin" />
                    Gerando PIX...
                  </div>
                ) : (
                  'Gerar PIX'
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'pix' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {formatCurrency(parseFloat(amount))}
              </h3>
              <p className="text-gray-600">
                Escaneie o QR Code ou copie o código PIX
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="qr-code" className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">QR Code PIX</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Código PIX */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código PIX Copia e Cola
              </label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {pixData.pixCode}
                  </p>
                </div>
                <Button variant="secondary" onClick={copyPixCode}>
                  <Icon name="copy" className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="clock" className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-900 font-medium">
                    Expira em: {pixData.expiresAt.toLocaleTimeString('pt-BR')}
                  </p>
                  <p className="text-amber-800 mt-1">
                    Após o pagamento, o valor será creditado automaticamente em sua carteira.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleConfirmPayment} className="flex-1">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Icon name="clock" className="w-4 h-4 animate-spin" />
                    Confirmando...
                  </div>
                ) : (
                  'Já Paguei'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="check" className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pagamento Confirmado!
              </h3>
              <p className="text-gray-600">
                {formatCurrency(parseFloat(amount))} foi creditado em sua carteira
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-800">Saldo anterior:</span>
                <span className="font-medium text-green-900">
                  {formatCurrency(wallet.available_balance)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-green-800">Novo saldo:</span>
                <span className="font-medium text-green-900">
                  {formatCurrency(wallet.available_balance + parseFloat(amount))}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Esta janela será fechada automaticamente...
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default DepositModal