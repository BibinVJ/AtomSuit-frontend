import type { FC, ReactNode, ChangeEvent } from "react";

interface InputProps {
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  autoComplete?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  prefix?: string;
  suffix?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  defaultValue,
  autoComplete,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  rightIcon,
  onRightIconClick,
  prefix,
  suffix,
}) => {
  let containerClasses = `relative flex items-center h-11 w-full rounded-lg border shadow-theme-xs focus-within:ring-3`;

  if (disabled) {
    containerClasses += ` text-gray-500 border-gray-300 opacity-40 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    containerClasses += ` border-red-500 focus-within:border-red-300 focus-within:ring-red-500/20 dark:text-red-400 dark:border-red-500 dark:focus-within:border-red-800`;
  } else if (success) {
    containerClasses += ` border-success-500 focus-within:border-success-300 focus-within:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus-within:border-success-800`;
  } else {
    containerClasses += ` bg-transparent text-gray-800 border-gray-300 focus-within:border-brand-300 focus-within:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus-within:border-brand-800`;
  }

  // Add overflow-hidden to ensure border-radius clips children and we don't bleed out
  containerClasses += " overflow-hidden";

  const inputClasses = `h-full flex-1 min-w-0 appearance-none ${prefix ? 'pl-2' : 'pl-3'} ${suffix ? 'pr-2' : 'pr-3'} py-2.5 text-sm bg-transparent placeholder:text-gray-400 focus:outline-none dark:text-white/90 dark:placeholder:text-white/30`;

  return (
    <div>
      <div className={`${containerClasses} ${className}`}>
        {prefix && (
          <div className="pl-3 pr-1 text-gray-500 text-sm whitespace-nowrap">{prefix}</div>
        )}

        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={inputClasses}
        />

        {suffix && (
          <div className="pl-1 pr-3 text-gray-500 text-sm whitespace-nowrap">{suffix}</div>
        )}

        {rightIcon && (
          <div
            className="px-2 cursor-pointer"
            onClick={onRightIconClick}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {hint && (
          <p
          className={`mt-1.5 text-xs h-5 ${error
              ? "text-red-500"
              : success
                ? "text-success-500"
                : "text-gray-500"
            }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
