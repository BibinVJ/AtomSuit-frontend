'use client';

import { useState, useEffect } from 'react';
import { Setting } from '../../types';
import Button from '../ui/button/Button';
import FileInput from '../form/input/FileInput';
import Input from '../form/input/InputField';
import TextArea from '../form/input/TextArea';
import Switch from '../form/switch/Switch';
import Select from '../form/Select';
import MultiSelect from '../form/MultiSelect';
import { Save, Trash2, Clock } from 'lucide-react';
import { updateSetting, deleteSettingFile } from '../../services/SettingsService';
import { getChartOfAccounts } from '../../services/ChartOfAccountService';
import { getCurrencies } from '../../services/CurrencyService';
import { toast } from 'sonner';
import { formatLabel } from '../../utils/string';
import { useSettings } from '../../hooks/useSettings';
import Image from 'next/image';
import AddCurrencyModal from '../accounting/currencies/AddCurrencyModal';

interface Props {
  setting: Setting;
  onUpdate: () => void;
}

const DATE_FORMATS = [
  { value: 'Y-m-d', label: 'YYYY-MM-DD' },
  { value: 'd/m/Y', label: 'DD/MM/YYYY' },
  { value: 'm/d/Y', label: 'MM/DD/YYYY' },
  { value: 'd-m-Y', label: 'DD-MM-YYYY' },
  { value: 'F j, Y', label: 'Month Day, Year' },
  { value: 'j F Y', label: 'Day Month Year' },
];

const TIME_FORMATS = [
  { value: 'H:i:s', label: '24 Hour (with seconds)' },
  { value: 'H:i', label: '24 Hour' },
  { value: 'g:i A', label: '12 Hour (AM/PM)' },
  { value: 'g:i a', label: '12 Hour (am/pm)' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const CURRENCY_POSITION_OPTIONS = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
];

const DAY_OPTIONS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
];

const TAX_ALGORITHM_OPTIONS = [
  { value: 'sum_per_line', label: 'Sum Per Line' },
  { value: 'total_based', label: 'Total Based' },
];

export default function SettingField({ setting, onUpdate }: Props) {
  const { refreshSettings } = useSettings();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [value, setValue] = useState<any>(setting.value);
  const [isLoading, setIsLoading] = useState(false);
  const [accountOptions, setAccountOptions] = useState<{ value: string; label: string }[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string }[]>([]);
  const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (setting.key.endsWith('_account')) {
        try {
          const response = await getChartOfAccounts({
            unpaginated: true,
            sort_by: 'code',
            sort_direction: 'asc',
          });
          setAccountOptions(
            response.data.map((account) => ({
              value: String(account.id),
              label: `${account.code} - ${account.name}`,
            }))
          );
        } catch (error) {
          console.error('Error fetching accounts:', error);
        }
      } else if (setting.key === 'currency') {
        try {
          const response = await getCurrencies({ unpaginated: true });
          setCurrencyOptions(
            response.data.map((currency) => ({
              value: String(currency.id),
              label: `${currency.code} (${currency.symbol}) - ${currency.name}`,
            }))
          );
        } catch (error) {
          console.error('Error fetching currencies:', error);
        }
      }
    };

    fetchOptions();
  }, [setting.key]);

  const fetchCurrencyOptions = async () => {
    try {
      const response = await getCurrencies({ unpaginated: true });
      setCurrencyOptions(
        response.data.map((currency) => ({
          value: String(currency.id),
          label: `${currency.code} (${currency.symbol}) - ${currency.name}`,
        }))
      );
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSetting(setting.key, value, setting.type, setting.group);
      toast.success('Setting updated successfully');
      await refreshSettings();
      onUpdate();
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      await updateSetting(setting.key, file, 'file', setting.group);
      toast.success('File uploaded successfully');
      onUpdate();
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    setIsLoading(true);
    try {
      await deleteSettingFile(setting.key);
      toast.success('File deleted successfully');
      onUpdate();
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = () => {
    const isColorField = setting.key.includes('color');
    const isDateFormat = setting.key.includes('date_format');
    const isTimeFormat = setting.key.includes('time_format');
    const isTheme = setting.key === 'theme';
    const isCurrencyPosition = setting.key === 'currency_position';
    const isBusinessDays = setting.key === 'business_days';
    const isWeekStart = setting.key === 'week_start';
    const isTimeField = setting.key.includes('business_hours');
    const isAccountField = setting.key.endsWith('_account');
    const isCurrencyField = setting.key === 'currency';
    const isTaxAlgorithm = setting.key === 'tax_algorithm';

    // Handle special cases before type-based rendering
    if (isBusinessDays) {
      const currentValues = Array.isArray(value) ? value.map(String) : [];
      return (
        <MultiSelect
          label=""
          options={DAY_OPTIONS.map((day) => ({ value: day.value, text: day.label }))}
          defaultSelected={currentValues}
          onChange={(selected) => setValue(selected.map(Number))}
        />
      );
    }

    if (isWeekStart) {
      return (
        <Select
          options={DAY_OPTIONS}
          onChange={(selectedValue) => setValue(parseInt(selectedValue))}
          placeholder="Select week start day"
          defaultValue={String(value || 1)}
        />
      );
    }

    if (isAccountField) {
      return (
        <Select
          options={accountOptions}
          onChange={(selectedValue) => setValue(parseInt(selectedValue))}
          placeholder="Select account"
          defaultValue={String(value || '')}
        />
      );
    }

    if (isCurrencyField) {
      return (
        <div className="space-y-2">
          <Select
            options={currencyOptions}
            onChange={(selectedValue) => setValue(parseInt(selectedValue))}
            placeholder="Select currency"
            defaultValue={String(value || '')}
          />
          <button
            type="button"
            onClick={() => setIsAddCurrencyModalOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            + Add New Currency
          </button>
          <AddCurrencyModal
            isOpen={isAddCurrencyModalOpen}
            onClose={() => setIsAddCurrencyModalOpen(false)}
            onSuccess={() => {
              fetchCurrencyOptions();
              // Optionally verify if we need to auto-select the new currency,
              // but for now just refreshing the list is sufficient.
            }}
          />
        </div>
      );
    }

    if (isTaxAlgorithm) {
      return (
        <Select
          options={TAX_ALGORITHM_OPTIONS}
          onChange={(selectedValue) => setValue(selectedValue)}
          placeholder="Select tax algorithm"
          defaultValue={value || 'sum_per_line'}
        />
      );
    }

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch label="" checked={Boolean(value)} onChange={(checked) => setValue(checked)} />
        );
      case 'integer':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => setValue(parseInt(e.target.value) || 0)}
          />
        );
      case 'file':
        const isImage =
          setting.file_url && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(setting.file_url);
        return (
          <div className="space-y-2">
            <FileInput onChange={handleFileChange} />
            {setting.file_url && (
              <div className="space-y-2">
                {isImage ? (
                  <div className="relative w-full max-w-xs h-32">
                    <Image
                      src={setting.file_url}
                      alt={setting.key}
                      fill
                      className="object-contain border border-gray-200 rounded-lg dark:border-gray-700"
                    />
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <a
                    href={setting.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {isImage ? 'View full image' : 'View current file'}
                  </a>
                  <Button
                    size="xs"
                    onClick={handleDeleteFile}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      case 'json':
        return (
          <TextArea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(newValue) => {
              try {
                setValue(JSON.parse(newValue));
              } catch {
                setValue(newValue);
              }
            }}
            rows={4}
          />
        );
      default:
        if (isTheme) {
          return (
            <Select
              options={THEME_OPTIONS}
              onChange={(selectedValue) => setValue(selectedValue)}
              placeholder="Select theme"
              defaultValue={value || 'system'}
            />
          );
        }
        if (isCurrencyPosition) {
          return (
            <Select
              options={CURRENCY_POSITION_OPTIONS}
              onChange={(selectedValue) => setValue(selectedValue)}
              placeholder="Select currency position"
              defaultValue={value || 'before'}
            />
          );
        }
        if (isDateFormat) {
          return (
            <Select
              options={DATE_FORMATS}
              onChange={(selectedValue) => setValue(selectedValue)}
              placeholder="Select date format"
              defaultValue={value || ''}
            />
          );
        }
        if (isTimeFormat) {
          return (
            <Select
              options={TIME_FORMATS}
              onChange={(selectedValue) => setValue(selectedValue)}
              placeholder="Select time format"
              defaultValue={value || ''}
            />
          );
        }
        if (isTimeField) {
          return (
            <div className="relative">
              <Input type="time" value={value || ''} onChange={(e) => setValue(e.target.value)} />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <Clock className="size-6" />
              </span>
            </div>
          );
        }
        if (isColorField) {
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value || '#000000'}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={value || ''}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
                {setting.value !== null && setting.value !== undefined && (
                  <div
                    className="w-10 h-10 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: String(setting.value) }}
                    title={`Original: ${setting.value}`}
                  />
                )}
              </div>
            </div>
          );
        }
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        );
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{formatLabel(setting.key)}</h3>
          {setting.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {renderInput()}
        {setting.type !== 'file' && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
