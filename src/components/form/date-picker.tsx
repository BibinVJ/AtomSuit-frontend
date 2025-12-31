'use client';

import { useEffect, useCallback } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import { Calendar } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: 'single' | 'multiple' | 'range' | 'time';
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string | React.ReactNode;
  placeholder?: string;
  error?: boolean;
  hint?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  error = false,
  hint,
}: PropsType) {
  const { getSetting } = useSettings();
  const phpFormat = getSetting('date_format', 'Y-m-d');

  const mapPhpDateFormatToFlatpickr = useCallback((phpFormat: string) => {
    const map: Record<string, string> = {
      'Y-m-d': 'Y-m-d',
      'd/m/Y': 'd/m/Y',
      'm/d/Y': 'm/d/Y',
      'd-m-Y': 'd-m-Y',
      'F j, Y': 'F j, Y',
      'j F Y': 'j F Y',
    };
    return map[phpFormat] || 'Y-m-d';
  }, []);

  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || 'single',
      static: true,
      monthSelectorType: 'static',
      dateFormat: 'Y-m-d', // Internal format
      altInput: true, // Enable display format
      altFormat: mapPhpDateFormatToFlatpickr(phpFormat), // Display format from settings
      defaultDate,
      onChange,
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, phpFormat, mapPhpDateFormatToFlatpickr]);

  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30`;

  if (error) {
    inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800`;
  }

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input id={id} placeholder={placeholder} className={inputClasses} />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <Calendar className="size-6" />
        </span>
      </div>
      {hint && (
        <p className={`mt-1.5 text-xs ${error ? 'text-error-500' : 'text-gray-500'}`}>{hint}</p>
      )}
    </div>
  );
}
