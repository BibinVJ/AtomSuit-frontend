import { useState, useEffect } from 'react';
import FormModal from '@/components/common/FormModal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { toast } from 'sonner';
import { updateCostCenter } from '@/services/CostCenterService';
import { getWarehouses } from '@/services/WarehouseService';
import { getCostCenters } from '@/services/CostCenterService';
import { CostCenter, CostCenterType } from '@/types';
import { isApiError } from '@/utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  costCenter: CostCenter;
}

export default function EditCostCenterModal({ isOpen, onClose, onSuccess, costCenter }: Props) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    parent_id: '',
    warehouse_id: '',
  });

  const [warehouses, setWarehouses] = useState<{ label: string; value: string }[]>([]);
  const [parentCostCenters, setParentCostCenters] = useState<{ label: string; value: string }[]>(
    []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        code: costCenter.code,
        name: costCenter.name,
        type: costCenter.type,
        parent_id: costCenter.parent_id ? String(costCenter.parent_id) : '',
        warehouse_id: costCenter.warehouse_id ? String(costCenter.warehouse_id) : '',
      });

      const fetchOptions = async () => {
        try {
          const [whData, ccData] = await Promise.all([
            getWarehouses({ unpaginated: true }),
            getCostCenters({ unpaginated: true }),
          ]);

          const whList = (whData.data || whData).map(
            (w: { id: string | number; name: string }) => ({ label: w.name, value: String(w.id) })
          );
          setWarehouses(whList);

          const ccList = (ccData.data || ccData)
            .filter((c: { id: string | number }) => c.id !== costCenter.id)
            .map((c: { id: string | number; name: string }) => ({
              label: c.name,
              value: String(c.id),
            }));
          setParentCostCenters(ccList);
        } catch (error) {
          console.error('Failed to fetch options', error);
        }
      };
      fetchOptions();
    }
  }, [isOpen, costCenter]);

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSubmit = {
      ...formData,
      type: formData.type as CostCenterType,
      parent_id: formData.parent_id ? Number(formData.parent_id) : undefined,
      warehouse_id: formData.warehouse_id ? Number(formData.warehouse_id) : undefined,
    };

    try {
      await updateCostCenter(costCenter.id, dataToSubmit);
      onSuccess();
      toast.success('Cost Center updated successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        if (apiErrors) {
          Object.keys(apiErrors).forEach((key) => {
            formattedErrors[key] = apiErrors[key][0];
          });
        }
        setErrors(formattedErrors);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to update Cost Center');
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = Object.values(CostCenterType).map((type) => ({ label: type, value: type }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Edit Cost Center"
      description="Update cost center details."
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5">
        <div>
          <Label>
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={formData.code}
            onChange={(e) => {
              setFormData({ ...formData, code: e.target.value });
              setErrors((prev) => ({ ...prev, code: '' }));
            }}
            error={!!errors.code}
            hint={errors.code}
          />
        </div>
        <div>
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>

        <div>
          <Label>
            Type <span className="text-red-500">*</span>
          </Label>
          <Select
            options={typeOptions}
            value={formData.type}
            onChange={(val) => {
              setFormData({ ...formData, type: val });
              setErrors((prev) => ({ ...prev, type: '' }));
            }}
            placeholder="Select Type"
            error={!!errors.type}
          />
          {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
        </div>

        <div>
          <Label>Parent Cost Center</Label>
          <Select
            options={parentCostCenters}
            value={formData.parent_id}
            onChange={(val) => setFormData({ ...formData, parent_id: val })}
            placeholder="Select Parent (Optional)"
          />
        </div>

        <div>
          <Label>Warehouse</Label>
          <Select
            options={warehouses}
            value={formData.warehouse_id}
            onChange={(val) => setFormData({ ...formData, warehouse_id: val })}
            placeholder="Select Warehouse (Optional)"
          />
        </div>
      </div>
    </FormModal>
  );
}
