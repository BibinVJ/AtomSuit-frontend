"use client";

import { useState } from 'react';
import { Modal } from '../../ui/modal';
import Button from '../../ui/button/Button';
import FileInput from '../../form/input/FileInput';
import { toast } from 'sonner';
import { importItems, downloadSampleItemExcel } from '../../../services/ItemService';
import { isApiError } from '../../../utils/errors';
import { Download, Upload } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onItemsImported: () => void;
}

export default function ImportItemModal({ isOpen, onClose, onItemsImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await downloadSampleItemExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_items.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading sample:', error);
      toast.error('Failed to download sample file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      await importItems(file);
      toast.success('Items imported successfully');
      onItemsImported();
      onClose();
      setFile(null);
    } catch (error) {
      if (isApiError(error)) {
        toast.error(error.response?.data?.message || 'Import failed');
      } else {
        toast.error('Failed to import items');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px]">
      <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Import Items
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Upload an Excel file to add multiple items at once.
          </p>
        </div>

        <div className="px-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            className="flex items-center gap-2 mb-4"
            startIcon={<Download className="w-4 h-4" />}
          >
            Download Sample Excel
          </Button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Excel File (.xlsx, .xls, .csv)
              </label>
              <FileInput
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex items-center gap-3 mt-6 lg:justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !file}
                startIcon={!isUploading && <Upload className="w-4 h-4" />}
              >
                {isUploading ? 'Uploading...' : 'Upload & Import'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
