import { InputHTMLAttributes, forwardRef, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  success?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onValidate?: (value: string) => string | null
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    hint, 
    success, 
    loading,
    leftIcon,
    rightIcon,
    onValidate,
    className = '', 
    onBlur,
    onChange,
    ...props 
  }, ref) => {
    const [focused, setFocused] = useState(false)
    const [internalError, setInternalError] = useState<string | null>(null)
    
    const displayError = error || internalError
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      
      if (onValidate) {
        const validationError = onValidate(e.target.value)
        setInternalError(validationError)
      }
      
      onBlur?.(e)
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Clear validation error when user starts typing
      if (internalError) {
        setInternalError(null)
      }
      
      onChange?.(e)
    }
    
    const getInputClasses = () => {
      const baseClasses = `
        w-full px-4 py-3 border rounded-lg 
        text-gray-900 placeholder-gray-500
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      `
      
      const stateClasses = displayError 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
        : success
        ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
        : focused
        ? 'border-primary-300 focus:border-primary-500 focus:ring-primary-200'
        : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-primary-200'
      
      const iconClasses = (leftIcon || rightIcon) ? 'pr-12' : ''
      
      return `${baseClasses} ${stateClasses} ${iconClasses} ${className}`.trim()
    }

    return (
      <div className="form-field">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input 
            ref={ref}
            className={getInputClasses()}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            onChange={handleChange}
            style={leftIcon ? { paddingLeft: '3rem' } : {}}
            {...props} 
          />
          
          {(rightIcon || loading || success) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-600" />
              ) : success ? (
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : rightIcon ? (
                <div className="text-gray-400">
                  {rightIcon}
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        {hint && !displayError && (
          <p className="mt-1 text-sm text-gray-600">{hint}</p>
        )}
        
        {displayError && (
          <div className="mt-1 flex items-center text-sm text-red-600">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {displayError}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

