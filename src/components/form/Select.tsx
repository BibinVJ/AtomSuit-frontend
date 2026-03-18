'use client';

import React from 'react';
import ReactSelect, { SingleValue } from 'react-select';

interface Option {
  value: string;
  label: string;
  className?: string;
  variant?: 'default' | 'danger' | 'success';
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  error?: boolean;
  hint?: string;
  searchable?: boolean;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = 'Select...',
  onChange,
  className = '',
  defaultValue,
  value,
  error = false,
  hint,
  searchable = true,
  disabled = false,
}) => {
  // Find selected option object based on value string
  const selectedOption =
    options.find((opt) => opt.value === value) ||
    (defaultValue ? options.find((opt) => opt.value === defaultValue) : null);

  const handleChange = (newValue: SingleValue<Option>) => {
    if (newValue) {
      onChange(newValue.value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <ReactSelect
        value={selectedOption}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={searchable}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        classNames={{
          menuPortal: () => '!z-[1000005]',
          control: ({ isFocused }) =>
            `!min-h-[2.75rem] !rounded-lg !border !bg-white dark:!bg-gray-900 !px-3 !text-sm !shadow-theme-xs ${
              error
                ? '!border-red-500'
                : isFocused
                  ? '!border-brand-500 !ring-1 !ring-brand-500'
                  : '!border-gray-300 dark:!border-gray-700'
            }`,
          option: ({ isFocused, isSelected, data }) => {
            const isDanger = data.variant === 'danger';

            // Base classes
            let classes = '!px-4 !py-2 !text-sm !cursor-pointer';

            if (isSelected) {
              if (isDanger) {
                // For danger items, keep them red even when selected, maybe slightly darker background
                classes += ' !bg-red-100 dark:!bg-red-900/40 !text-red-600 dark:!text-red-400';
              } else {
                classes += ' !bg-brand-500 !text-white';
              }
            } else if (isFocused) {
              if (isDanger) {
                classes += ' !bg-red-50 dark:!bg-red-900/20 !text-red-500';
              } else {
                classes += ' !bg-gray-100 dark:!bg-gray-700 dark:text-gray-300 text-gray-700';
              }
            } else {
              if (isDanger) {
                classes += ' !bg-red-50 dark:!bg-red-900/10 !text-red-500';
              } else {
                classes += ' text-gray-700 dark:text-gray-300';
              }
            }

            return `${classes} ${data.className || ''}`;
          },
          menu: () =>
            '!bg-white dark:!bg-gray-800 !border !border-gray-300 dark:!border-gray-700 !rounded-lg !shadow-lg !mt-1',
          input: () => '!text-gray-800 dark:!text-gray-200',
          singleValue: ({ data }) => {
            const variantClasses = {
              default: '!text-gray-800 dark:!text-gray-200',
              danger: '!text-red-500',
              success: '!text-green-500',
            };
            const variantClass = data.variant
              ? variantClasses[data.variant] || variantClasses.default
              : variantClasses.default;
            return `${variantClass} ${data.className || ''}`;
          },
          placeholder: () => '!text-gray-400',
          dropdownIndicator: () => '!text-gray-500 dark:!text-gray-400',
          clearIndicator: () => '!text-gray-500 dark:!text-gray-400',
          indicatorSeparator: () => '!hidden',
          menuList: () => '!py-1 custom-scrollbar',
        }}
        unstyled // Use strict tailwind classes by disabling default styles
      />

      {hint && (
        <span className={`mt-1.5 block text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {hint}
        </span>
      )}
    </div>
  );
};

export default Select;
