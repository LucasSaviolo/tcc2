import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helper,
  fullWidth = true,
  startIcon,
  endIcon,
  leftIcon,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'input';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500';
  const widthClass = fullWidth ? 'w-full' : '';
  const paddingClass = (startIcon || leftIcon) ? 'pl-10' : endIcon ? 'pr-10' : '';

  const inputClasses = `${baseClasses} ${errorClasses} ${widthClass} ${paddingClass} ${className}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {(startIcon || leftIcon) && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 text-sm">
              {startIcon || leftIcon}
            </div>
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-gray-400 text-sm">
              {endIcon}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
export { Input };

