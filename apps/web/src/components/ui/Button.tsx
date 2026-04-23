import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'white';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-glow-sm focus-visible:ring-primary-400 active:scale-[0.97]',
  outline:
    'border-2 border-gray-200 bg-white text-gray-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-400 active:scale-[0.97]',
  ghost:
    'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-300 active:scale-[0.97]',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500 active:scale-[0.97]',
  white:
    'bg-white text-primary-700 hover:bg-primary-50 shadow-sm focus-visible:ring-white active:scale-[0.97]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
  xl: 'px-8 py-3.5 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, fullWidth, children, className = '', disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 font-semibold select-none',
          'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
