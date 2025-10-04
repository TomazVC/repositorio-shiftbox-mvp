import { useState, useRef } from 'react'
import Icon from './Icon'
import Button from './Button'

interface FileUploadProps {
  label: string
  accept?: string
  maxSize?: number // em MB
  onFileSelect: (file: File) => void
  loading?: boolean
  error?: string
  hint?: string
}

export default function FileUpload({
  label,
  accept = 'image/*,.pdf,.doc,.docx',
  maxSize = 5,
  onFileSelect,
  loading = false,
  error,
  hint
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    // Validar tamanho do arquivo
    if (file.size > maxSize * 1024 * 1024) {
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      default:
        return '📎'
    }
  }

  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all
          ${dragActive ? 'border-primary bg-primary-light' : 'border-gray-300'}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary hover:bg-gray-50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mb-2"></div>
            <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
              Enviando arquivo...
            </p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">
              {getFileIcon(selectedFile.name)}
            </div>
            <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {selectedFile.name}
            </p>
            <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
              {formatFileSize(selectedFile.size)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFile(null)
              }}
              className="mt-2"
            >
              Remover
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
              Arquivos suportados: JPG, PNG, PDF, DOC (máx. {maxSize}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="form-error mt-2 flex items-center gap-2">
          <Icon name="alert-triangle" size={16} />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="form-hint mt-2">
          {hint}
        </p>
      )}
    </div>
  )
}