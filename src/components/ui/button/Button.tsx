import { ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: 'xs' | 'sm' | 'md'; // Button size
  variant?: 'primary' | 'outline' | 'danger' | 'ghost'; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  isLoading?: boolean; // Loading state
  className?: string; // Disabled state
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  startIcon,
  endIcon,
  onClick,
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
  href,
  target,
}) => {
  // Size Classes
  const sizeClasses = {
    xs: 'px-3 py-2 text-xs',
    sm: 'px-4 py-3 text-sm',
    md: 'px-5 py-3.5 text-sm',
  };

  // Variant Classes
  const variantClasses = {
    primary: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
    outline:
      'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300',
    danger: 'bg-red-500 text-white shadow-theme-xs hover:bg-red-600 disabled:bg-red-300',
    ghost:
      'bg-transparent text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300',
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-lg transition ${className} ${
    sizeClasses[size]
  } ${variantClasses[variant]} ${disabled || isLoading ? 'cursor-not-allowed opacity-50' : ''}`;

  const spinnerIcon = (
    <svg
      className="animate-spin h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  const content = (
    <>
      {isLoading && spinnerIcon}
      {!isLoading && startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {!isLoading && endIcon && <span className="flex items-center">{endIcon}</span>}
    </>
  );

  if (href) {
    if (disabled || isLoading) {
      return (
        <span className={baseClasses} aria-disabled="true">
          {content}
        </span>
      );
    }
    return (
      <Link href={href} className={baseClasses} target={target}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClasses} onClick={onClick} disabled={disabled || isLoading} type={type}>
      {content}
    </button>
  );
};

export default Button;
