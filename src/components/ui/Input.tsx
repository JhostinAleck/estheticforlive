import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'w-full px-4 py-3 border rounded-xl transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
          'placeholder:text-muted/60',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-border',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
