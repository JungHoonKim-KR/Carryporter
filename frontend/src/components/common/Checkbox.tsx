import React, { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-start">
          <input
            ref={ref}
            type="checkbox"
            className={`
              w-5 h-5 mt-0.5
              text-blue-600
              border-gray-300 rounded
              focus:ring-2 focus:ring-blue-500
              cursor-pointer
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          <label className="ml-3 text-sm text-gray-700 cursor-pointer select-none">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
