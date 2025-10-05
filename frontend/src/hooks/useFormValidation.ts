import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | undefined
  message?: string
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface ValidationErrors {
  [key: string]: string
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback((name: string, value: any): string => {
    const rule = validationRules[name]
    if (!rule) return ''

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${name} é obrigatório`
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return ''
    }

    // String validations
    if (typeof value === 'string') {
      // Min length
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `${name} deve ter pelo menos ${rule.minLength} caracteres`
      }

      // Max length
      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `${name} deve ter no máximo ${rule.maxLength} caracteres`
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `${name} não atende ao formato esperado`
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value)
      if (customError) return customError
    }

    return ''
  }, [validationRules])

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validationRules, validateField])

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [touched, validateField])

  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Validate field when it's touched
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [values, validateField])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }))
  }, [])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateForm,
    resetForm,
    setFormValues,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0
  }
}

// Predefined validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  cep: /^\d{5}-?\d{3}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
}

// Helper validation functions
export const validators = {
  email: (value: string) => 
    validationPatterns.email.test(value) ? undefined : 'E-mail inválido',
  
  phone: (value: string) => 
    validationPatterns.phone.test(value) ? undefined : 'Telefone inválido',
  
  cpf: (value: string) => 
    validationPatterns.cpf.test(value) ? undefined : 'CPF inválido',
  
  cnpj: (value: string) => 
    validationPatterns.cnpj.test(value) ? undefined : 'CNPJ inválido',
  
  strongPassword: (value: string) => 
    validationPatterns.password.test(value) 
      ? undefined 
      : 'Senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número',
  
  positiveNumber: (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return num > 0 ? undefined : 'Valor deve ser positivo'
  },
  
  minValue: (min: number) => (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return num >= min ? undefined : `Valor deve ser pelo menos ${min}`
  },
  
  maxValue: (max: number) => (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return num <= max ? undefined : `Valor deve ser no máximo ${max}`
  },
}