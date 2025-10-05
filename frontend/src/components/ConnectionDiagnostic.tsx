import { useState, useEffect } from 'react'
import Card from './Card'
import Button from './Button'

const ConnectionDiagnostic = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [proxyStatus, setProxyStatus] = useState<'checking' | 'working' | 'failed'>('checking')
  const [lastCheck, setLastCheck] = useState<string>('')

  const checkBackendDirect = async () => {
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        mode: 'cors'
      })
      if (response.ok) {
        setBackendStatus('online')
        return true
      }
    } catch (error) {
      console.warn('Direct backend check failed:', error)
    }
    setBackendStatus('offline')
    return false
  }

  const checkBackendProxy = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET'
      })
      if (response.ok) {
        setProxyStatus('working')
        return true
      }
    } catch (error) {
      console.warn('Proxy backend check failed:', error)
    }
    setProxyStatus('failed')
    return false
  }

  const runDiagnostic = async () => {
    setBackendStatus('checking')
    setProxyStatus('checking')
    setLastCheck(new Date().toLocaleTimeString())

    // Verificar backend direto
    const directOk = await checkBackendDirect()
    
    // Verificar via proxy
    const proxyOk = await checkBackendProxy()

    console.log('Diagnostic results:', { directOk, proxyOk })
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'working':
        return 'text-green-600'
      case 'offline':
      case 'failed':
        return 'text-red-600'
      case 'checking':
      default:
        return 'text-yellow-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '✅ Online'
      case 'working':
        return '✅ Funcionando'
      case 'offline':
        return '❌ Offline'
      case 'failed':
        return '❌ Falhou'
      case 'checking':
        return '⏳ Verificando...'
      default:
        return '❓ Desconhecido'
    }
  }

  return (
    <Card className="p-6 mb-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            🔍 Diagnóstico de Conexão
          </h3>
          <p className="text-sm text-gray-600">
            Verificando conectividade com o backend
          </p>
        </div>
        <Button onClick={runDiagnostic} size="sm">
          Verificar Novamente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Backend Direto</h4>
          <div className="text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span>URL:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                http://localhost:8000
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className={`font-medium ${getStatusColor(backendStatus)}`}>
                {getStatusText(backendStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Via Proxy (Vite)</h4>
          <div className="text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span>URL:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                /api
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className={`font-medium ${getStatusColor(proxyStatus)}`}>
                {getStatusText(proxyStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {lastCheck && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Última verificação: {lastCheck}
          </p>
        </div>
      )}

      {/* Instruções de solução */}
      {backendStatus === 'offline' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h5 className="font-medium text-yellow-800 mb-2">
            🔧 Backend Offline - Como resolver:
          </h5>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>1. Abra um terminal no diretório do backend</p>
            <p>2. Execute: <code className="bg-yellow-100 px-1 rounded">cd backend</code></p>
            <p>3. Execute: <code className="bg-yellow-100 px-1 rounded">.\venv\Scripts\activate</code></p>
            <p>4. Execute: <code className="bg-yellow-100 px-1 rounded">python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload</code></p>
          </div>
        </div>
      )}

      {backendStatus === 'online' && proxyStatus === 'working' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h5 className="font-medium text-green-800 mb-2">
            ✅ Tudo funcionando!
          </h5>
          <p className="text-sm text-green-700">
            Backend conectado com sucesso. Todas as funcionalidades devem estar operacionais.
          </p>
        </div>
      )}
    </Card>
  )
}

export default ConnectionDiagnostic