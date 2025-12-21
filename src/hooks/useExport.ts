import { toast } from 'sonner';

interface ExportOptions {
  exportFunction: () => Promise<{ data: unknown }>;
  entityName: string;
}

export function useExport() {
  const exportData = async ({ exportFunction, entityName }: ExportOptions) => {
    try {
      const response = await exportFunction();
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      link.setAttribute('download', `${entityName.toLowerCase()}_export_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(`Failed to export ${entityName.toLowerCase()}`);
      console.error('Export error:', error);
    }
  };

  return { exportData };
}
