import { FC, ReactNode, InputHTMLAttributes, useState, useEffect } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

const Input: FC<InputProps> = ({
  className = '',
  disabled = false,
  success = false,
  error = false,
  hint,
  leftIcon,
  rightIcon,
  onRightIconClick,
  prefix,
  suffix,
  decimalPlaces,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(props.value ?? '');

  useEffect(() => {
    if (props.type === 'number') {
      const externalStr = String(props.value ?? '');
      const localStr = String(localValue ?? '');

      if (externalStr !== localStr) {
        // If they parse to the same number (e.g., "0" vs "", "0" vs "0."),
        // we keep the local string to prevent stripping user input.
        // Otherwise, sync from external props.
        if (Number(externalStr) !== Number(localStr)) {
          setLocalValue(props.value ?? '');
        }
      }
    } else {
      setLocalValue(props.value ?? '');
    }
  }, [props.value, props.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const step =
    props.type === 'number' && decimalPlaces !== undefined
      ? (1 / Math.pow(10, decimalPlaces)).toString()
      : props.step;

  let containerClasses = `relative flex items-center h-11 w-full rounded-lg border shadow-theme-xs focus-within:ring-3`;

  if (disabled) {
    containerClasses += ` text-gray-500 border-gray-300 opacity-40 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    containerClasses += ` border-red-500 focus-within:border-red-300 focus-within:ring-red-500/20 dark:text-red-400 dark:border-red-500 dark:focus-within:border-red-800`;
  } else if (success) {
    containerClasses += ` border-success-500 focus-within:border-success-300 focus-within:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus-within:border-success-800`;
  } else {
    containerClasses += ` bg-white text-gray-800 border-gray-300 focus-within:border-brand-300 focus-within:ring-brand-500/20 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:focus-within:border-brand-800`;
  }

  // Add overflow-hidden to ensure border-radius clips children and we don't bleed out
  containerClasses += ' overflow-hidden';

  const inputClasses = `h-full flex-1 min-w-0 appearance-none ${prefix || leftIcon ? 'pl-2' : 'pl-3'} ${suffix || rightIcon ? 'pr-2' : 'pr-3'} py-2.5 text-sm bg-transparent placeholder:text-gray-400 focus:outline-none dark:text-white/90 dark:placeholder:text-white/30`;

  return (
    <div>
      <div className={`${containerClasses} ${className}`}>
        {leftIcon && <div className="pl-3 pr-1 text-gray-500">{leftIcon}</div>}

        {prefix && (
          <div className="pl-3 pr-1 text-gray-500 text-sm whitespace-nowrap">{prefix}</div>
        )}

        <input
          disabled={disabled}
          step={step}
          className={inputClasses}
          {...props}
          value={props.type === 'number' ? (localValue ?? '') : props.value}
          onChange={props.type === 'number' ? handleChange : props.onChange}
        />

        {suffix && (
          <div className="pl-1 pr-3 text-gray-500 text-sm whitespace-nowrap">{suffix}</div>
        )}

        {rightIcon && (
          <div className="px-2 cursor-pointer" onClick={onRightIconClick}>
            {rightIcon}
          </div>
        )}
      </div>

      {hint && (
        <p
          className={`mt-1.5 text-xs h-5 ${
            error ? 'text-red-500' : success ? 'text-success-500' : 'text-gray-500'
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
