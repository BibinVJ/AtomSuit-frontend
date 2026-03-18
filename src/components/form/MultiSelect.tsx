'use client';

import React from 'react';
import ReactSelect, { MultiValue } from 'react-select';

interface Option {
  value: string;
  text: string;
  className?: string;
  variant?: 'default' | 'danger' | 'success';
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  searchable?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false,
  placeholder = 'Select options',
  searchable = true,
}) => {
  // Map strings to option objects
  const selectedValues = options.filter((opt) => defaultSelected.includes(opt.value));

  // React Select expects options with label, we have text
  const adaptedOptions = options.map((opt) => ({
    value: opt.value,
    label: opt.text,
    className: opt.className,
    variant: opt.variant,
  }));
  const adaptedSelected = selectedValues.map((opt) => ({
    value: opt.value,
    label: opt.text,
    className: opt.className,
    variant: opt.variant,
  }));

  const handleChange = (
    newValue: MultiValue<{ value: string; label: string; className?: string; variant?: string }>
  ) => {
    if (onChange) {
      onChange(newValue.map((item) => item.value));
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
        </label>
      )}

      <ReactSelect
        isMulti
        value={adaptedSelected}
        onChange={handleChange}
        options={adaptedOptions}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={searchable}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        classNames={{
          menuPortal: () => '!z-[1000005]',
          control: ({ isFocused }) =>
            `!min-h-[2.75rem] !rounded-lg !border !bg-white dark:!bg-gray-900 !px-3 !py-1.5 !text-sm !shadow-theme-xs ${
              isFocused
                ? '!border-brand-500 !ring-1 !ring-brand-500'
                : '!border-gray-300 dark:!border-gray-700'
            }`,
          option: ({ isFocused, isSelected, data }) => {
            const isDanger = data.variant === 'danger';

            let classes = '!px-4 !py-2 !text-sm !cursor-pointer';

            if (isSelected) {
              if (isDanger) {
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
          multiValue: ({ data }) => {
            const isDanger = data.variant === 'danger';
            return `!rounded !text-sm !m-1 ${isDanger ? '!bg-red-100 dark:!bg-red-900' : '!bg-blue-100 dark:!bg-blue-900'}`;
          },
          multiValueLabel: ({ data }) => {
            const isDanger = data.variant === 'danger';
            return `!px-2 !py-0.5 ${isDanger ? '!text-red-800 dark:!text-red-200' : '!text-blue-800 dark:!text-blue-200'}`;
          },
          multiValueRemove: ({ data }) => {
            const isDanger = data.variant === 'danger';
            return `!rounded-r cursor-pointer ${
              isDanger
                ? '!text-red-600 dark:!text-red-300 hover:!bg-red-200 dark:hover:!bg-red-800'
                : '!text-blue-600 dark:!text-blue-300 hover:!bg-blue-200 dark:hover:!bg-blue-800'
            }`;
          },
          placeholder: () => '!text-gray-400',
        }}
        unstyled
      />
    </div>
  );
};

export default MultiSelect;
