"use client";

import { useState } from 'react';
import { Setting } from '../../types';
import Button from '../ui/button/Button';
import FileInput from '../form/input/FileInput';
import Switch from '../form/switch/Switch';
import Select from '../form/Select';
import { Save, Trash2 } from 'lucide-react';
import { updateSetting, deleteSettingFile } from '../../services/SettingsService';
import { toast } from 'sonner';

interface Props {
  setting: Setting;
  onUpdate: () => void;
}

const DATE_FORMATS = [
  { value: 'Y-m-d', label: '2024-01-15 (Y-m-d)' },
  { value: 'd/m/Y', label: '15/01/2024 (d/m/Y)' },
  { value: 'm/d/Y', label: '01/15/2024 (m/d/Y)' },
  { value: 'd-m-Y', label: '15-01-2024 (d-m-Y)' },
  { value: 'F j, Y', label: 'January 15, 2024 (F j, Y)' },
  { value: 'j F Y', label: '15 January 2024 (j F Y)' },
];

const TIME_FORMATS = [
  { value: 'H:i:s', label: '14:30:00 (H:i:s)' },
  { value: 'H:i', label: '14:30 (H:i)' },
  { value: 'g:i A', label: '2:30 PM (g:i A)' },
  { value: 'g:i a', label: '2:30 pm (g:i a)' },
];

export default function SettingField({ setting, onUpdate }: Props) {
  const [value, setValue] = useState(setting.value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSetting(setting.key, value, setting.type, setting.group);
      toast.success('Setting updated successfully');
      onUpdate();
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to delete file');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = () => {
    const isColorField = setting.key.includes('color');
    const isDateFormat = setting.key.includes('date_format');
    const isTimeFormat = setting.key.includes('time_format');

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            label=""
            checked={Boolean(value)}
            onChange={(checked) => setValue(checked)}
          />
        );
      case 'integer':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => setValue(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        );
      case 'file':
        const isImage = setting.file_url && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(setting.file_url);
        return (
          <div className="space-y-2">
            <FileInput onChange={handleFileChange} />
            {setting.file_url && (
              <div className="space-y-2">
                {isImage ? (
                  <div className="relative">
                    <img
                      src={setting.file_url}
                      alt={setting.key}
                      className="max-w-xs max-h-32 object-contain border border-gray-200 rounded-lg dark:border-gray-700"
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
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                setValue(JSON.parse(e.target.value));
              } catch {
                setValue(e.target.value);
              }
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        );
      default:
        if (isDateFormat) {
          return (
            <Select
              options={DATE_FORMATS}
              value={value || ''}
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
              value={value || ''}
              onChange={(selectedValue) => setValue(selectedValue)}
              placeholder="Select time format"
              defaultValue={value || ''}
            />
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
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {setting.value && (
                  <div
                    className="w-10 h-10 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: setting.value }}
                    title={`Original: ${setting.value}`}
                  />
                )}
              </div>
            </div>
          );
        }
        return (
          <input
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
          <h3 className="font-medium text-gray-900 dark:text-white">{setting.key}</h3>
          {setting.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
          )}
        </div>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{setting.type}</span>
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