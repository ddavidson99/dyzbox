'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  active?: boolean;
  tooltip?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  children,
  className,
  variant = 'ghost',
  size = 'md',
  disabled,
  loading,
  active,
  tooltip,
  type = 'button',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 transition-colors relative";
  
  const variantStyles = {
    primary: "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-200 border-l-2 border-l-blue-600",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-200",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-100"
  };
  
  const sizeStyles = {
    sm: "text-sm p-1",
    md: "text-base p-2",
    lg: "text-lg p-3"
  };
  
  const activeStyles = active ? "bg-gray-200 text-gray-800" : "";
  
  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled || loading ? "opacity-50 cursor-not-allowed" : "",
        activeStyles,
        className
      )}
      disabled={disabled || loading}
      title={tooltip}
      {...props}
    >
      {loading ? (
        <span className="animate-spin">
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      ) : children}
    </button>
  );
};

export default IconButton; 