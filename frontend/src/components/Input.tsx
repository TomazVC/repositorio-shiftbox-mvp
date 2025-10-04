import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  success?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, success, className = '', ...props }, ref) => {
    const inputClass = `input ${error ? 'error' : ''} ${success ? 'success' : ''} ${className}`

    return (
      <div className="form-field">
        {label && <label className="form-label">{label}</label>}
        <input ref={ref} className={inputClass} {...props} />
        {hint && !error && <span className="form-hint">{hint}</span>}
        {error && (
          <span className="form-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 10.5a.75.75 0 110 1.5.75.75 0 010-1.5zm0-6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4.5z" />
            </svg>
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

