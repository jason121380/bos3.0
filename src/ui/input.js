import React from 'react'
import { cn } from './utils'

// STYLE.md §6：高 36px、rounded-md、1px 控制項邊框（border-strong）；focus 2px accent；錯誤時 border 變 danger
export const inputClass = cn(
  'h-9 max-sm:h-10 w-full rounded-md border border-solid border-border-strong bg-background px-3 text-body text-text',
  'placeholder:text-text-tertiary transition-colors hover:border-border-strong-hover',
  'outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
  'disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-tertiary'
)

const Input = React.forwardRef(({ className, type = 'text', invalid, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    aria-invalid={invalid || undefined}
    className={cn('ui-root', inputClass, invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/30', className)}
    {...props}
  />
))
Input.displayName = 'Input'

const Textarea = React.forwardRef(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      'ui-root',
      inputClass,
      'h-auto min-h-[80px] py-2',
      invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/30',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

const Label = ({ className, required, children, ...props }) => (
  <label className={cn('ui-root text-label text-text-secondary', className)} {...props}>
    {children}
    {required && <span className="ml-0.5 text-danger">*</span>}
  </label>
)

// 表單欄位：標籤在上、輸入在中、說明或錯誤在下（STYLE.md §6 Form）
const Field = ({ label, htmlFor, required, hint, error, className, children }) => (
  <div className={cn('ui-root flex flex-col gap-1.5', className)}>
    {label && (
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
    )}
    {children}
    {error ? (
      <p id={htmlFor ? `${htmlFor}-helper-text` : undefined} className="text-caption text-danger">
        {error}
      </p>
    ) : (
      hint && <p className="text-caption text-text-tertiary">{hint}</p>
    )}
  </div>
)

export { Input, Textarea, Label, Field }
