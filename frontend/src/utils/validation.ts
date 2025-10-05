export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: { [field: string]: string }
}

export function validateField(value: any, rule: ValidationRule): string | null {
  // Required validation
  if (rule.required && (!value || value.toString().trim() === '')) {
    return rule.message || 'Este campo é obrigatório'
  }

  // Skip other validations if field is empty and not required
  if (!value || value.toString().trim() === '') {
    return null
  }

  const stringValue = value.toString()

  // Min length validation
  if (rule.minLength && stringValue.length < rule.minLength) {
    return rule.message || `Mínimo de ${rule.minLength} caracteres`
  }

  // Max length validation
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return rule.message || `Máximo de ${rule.maxLength} caracteres`
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return rule.message || 'Formato inválido'
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value)
  }

  return null
}

export function validateForm(data: any, schema: ValidationSchema): ValidationResult {
  const errors: { [field: string]: string } = {}

  for (const [field, rule] of Object.entries(schema)) {
    const error = validateField(data[field], rule)
    if (error) {
      errors[field] = error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validações comuns
export const commonValidations = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'E-mail inválido'
  },
  
  cpf: {
    required: true,
    custom: (value: string) => {
      const cpf = value.replace(/[^\d]/g, '')
      if (cpf.length !== 11) return 'CPF deve ter 11 dígitos'
      
      // Verificar se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cpf)) return 'CPF inválido'
      
      // Algoritmo de validação do CPF
      let sum = 0
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i)
      }
      let remainder = 11 - (sum % 11)
      if (remainder === 10 || remainder === 11) remainder = 0
      if (remainder !== parseInt(cpf.charAt(9))) return 'CPF inválido'
      
      sum = 0
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i)
      }
      remainder = 11 - (sum % 11)
      if (remainder === 10 || remainder === 11) remainder = 0
      if (remainder !== parseInt(cpf.charAt(10))) return 'CPF inválido'
      
      return null
    }
  },

  phone: {
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message: 'Telefone inválido. Use o formato (11) 99999-9999'
  },

  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) return 'Deve conter ao menos uma letra minúscula'
      if (!/(?=.*[A-Z])/.test(value)) return 'Deve conter ao menos uma letra maiúscula'
      if (!/(?=.*\d)/.test(value)) return 'Deve conter ao menos um número'
      if (!/(?=.*[!@#$%^&*])/.test(value)) return 'Deve conter ao menos um caractere especial'
      return null
    }
  },

  amount: {
    required: true,
    custom: (value: number) => {
      const num = Number(value)
      if (isNaN(num)) return 'Valor deve ser um número'
      if (num <= 0) return 'Valor deve ser maior que zero'
      if (num > 1000000) return 'Valor muito alto'
      return null
    }
  },

  positiveInteger: {
    required: true,
    custom: (value: number) => {
      const num = Number(value)
      if (isNaN(num)) return 'Deve ser um número'
      if (!Number.isInteger(num)) return 'Deve ser um número inteiro'
      if (num <= 0) return 'Deve ser maior que zero'
      return null
    }
  }
}

// Hook para usar validação em componentes
import { useState, useCallback } from 'react'

export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = useState<{ [field: string]: string }>({})

  const validateFieldHook = useCallback((field: string, value: any): string | null => {
    const rule = schema[field]
    if (!rule) return null

    const error = validateField(value, rule)
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }))
    
    return error
  }, [schema])

  const validateAll = useCallback((data: any) => {
    const result = validateForm(data, schema)
    setErrors(result.errors)
    return result
  }, [schema])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }))
  }, [])

  return {
    errors,
    validateField: validateFieldHook,
    validateAll,
    clearErrors,
    clearFieldError,
    hasErrors: Object.values(errors).some(error => error !== '')
  }
}