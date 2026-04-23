import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400',
            'transition-all duration-150 focus:outline-none focus:ring-2',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
              : 'border-gray-200 focus:border-primary-400 focus:ring-primary-400/20',
            'disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
