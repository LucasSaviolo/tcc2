import React, { forwardRef } from 'react';
import type { SelectHTMLAttributes, HTMLAttributes, OptionHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helper,
  fullWidth = true,
  leftIcon,
  children,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'input appearance-none pr-10';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500';
  const widthClass = fullWidth ? 'w-full' : '';
  const paddingClass = leftIcon ? 'pl-10' : '';

  const selectClasses = `${baseClasses} ${errorClasses} ${widthClass} ${paddingClass} ${className}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 text-sm">
              {leftIcon}
            </div>
          </div>
        )}
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
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

Select.displayName = 'Select';

// Para compatibilidade com as importações esperadas
interface SelectTriggerProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, ...props }) => {
  return <span {...props}>{placeholder}</span>;
};

interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const SelectContent: React.FC<SelectContentProps> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

interface SelectItemProps extends OptionHTMLAttributes<HTMLOptionElement> {
  children?: React.ReactNode;
}

const SelectItem: React.FC<SelectItemProps> = ({ children, ...props }) => {
  return <option {...props}>{children}</option>;
};

export default Select;
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };

