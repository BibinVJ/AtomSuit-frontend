'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../../ui/modal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { createItemPrice, updateItemPrice } from '../../../services/ItemPriceService';
import { getItems } from '../../../services/ItemService';
import Select from '../../form/Select';
import { ItemPrice } from '../../../types/ItemPrice';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  priceListId: number;
  itemPrice?: ItemPrice | null;
}

export default function AddItemPriceModal({
  isOpen,
  onClose,
  onSuccess,
  priceListId,
  itemPrice,
}: Props) {
  const [itemId, setItemId] = useState<number | undefined>(undefined);
  const [minQuantity, setMinQuantity] = useState('1');
  const [price, setPrice] = useState('');

  const [items, setItems] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState({
    item_id: '',
    min_quantity: '',
    price: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch Items for dropdown
      // Usually this might need to be a searchable select or paginated if many items exists.
      // For now, simpler implementation assuming manageable item count or existing paginated select component.
      const fetchItems = async () => {
        try {
          const res = await getItems({ unpaginated: true }); // Need to ensure getItems supports unpaginated or similar
          if (res && res.data) {
            setItems(
              res.data.map((i: any) => ({
                value: String(i.id),
                label: `${i.name} (${i.sku || '-'})`,
              }))
            );
          }
        } catch (error) {
          console.error('Error fetching items:', error);
          toast.error('Failed to fetch items');
        }
      };

      fetchItems();

      if (itemPrice) {
        setItemId(itemPrice.item_id);
        setMinQuantity(String(itemPrice.min_quantity));
        setPrice(String(itemPrice.price));
      } else {
        resetForm();
      }
    }
  }, [isOpen, itemPrice]);

  const resetForm = () => {
    setItemId(undefined);
    setMinQuantity('1');
    setPrice('');
    setErrors({ item_id: '', min_quantity: '', price: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { item_id: '', min_quantity: '', price: '' };
    let hasError = false;

    if (!itemId) {
      newErrors.item_id = 'Item is required';
      hasError = true;
    }
    if (!minQuantity || Number(minQuantity) < 0) {
      newErrors.min_quantity = 'Valid min quantity is required';
      hasError = true;
    }
    if (!price || Number(price) < 0) {
      newErrors.price = 'Valid price is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        price_list_id: priceListId,
        item_id: itemId,
        min_quantity: Number(minQuantity),
        price: Number(price),
      };

      if (itemPrice) {
        await updateItemPrice(itemPrice.id, payload);
        toast.success('Price updated successfully');
      } else {
        await createItemPrice(payload);
        toast.success('Price added successfully');
      }

      onSuccess();
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const newErrors = {
          item_id: apiErrors?.item_id?.[0] || '',
          min_quantity: apiErrors?.min_quantity?.[0] || '',
          price: apiErrors?.price?.[0] || '',
        };
        setErrors(newErrors);
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error saving item price:', error);
        toast.error('Failed to save item price');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[600px] p-6">
      <div className="relative w-full">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            {itemPrice ? 'Edit Item Price' : 'Add Item Price'}
          </h4>
        </div>
        <form className="flex flex-col mt-4" onSubmit={handleSubmit}>
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-4">
              <div>
                <Label>
                  Item <span className="text-red-500">*</span>
                </Label>
                <Select
                  options={items}
                  onChange={(value) => {
                    setItemId(Number(value));
                    setErrors({ ...errors, item_id: '' });
                  }}
                  defaultValue={itemId ? String(itemId) : ''}
                  error={!!errors.item_id}
                  hint={errors.item_id}
                  searchable
                  disabled={!!itemPrice} // Disable changing item on edit? Usually better UX unless complex.
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Min Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={minQuantity}
                    onChange={(e) => {
                      setMinQuantity(e.target.value);
                      setErrors({ ...errors, min_quantity: '' });
                    }}
                    error={!!errors.min_quantity}
                    hint={errors.min_quantity}
                  />
                </div>
                <div>
                  <Label>
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setErrors({ ...errors, price: '' });
                    }}
                    error={!!errors.price}
                    hint={errors.price}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
