'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../../ui/modal';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { getPriceLists } from '../../../services/PriceListService';
import {
  getItemPrices,
  createItemPrice,
  updateItemPrice,
  deleteItemPrice,
} from '../../../services/ItemPriceService';
import { PriceList } from '../../../types/PriceList';
import { ItemPrice } from '../../../types/ItemPrice';
import { Item } from '../../../types';
import Select from '../../form/Select';
import { Trash2, Plus } from 'lucide-react';
import CollapsibleSection from '../../common/CollapsibleSection';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
}

interface PriceRow {
  uniqueId: string;
  id?: number;
  price_list_id: string;
  price: string;
  min_quantity: string;
  priceListName?: string;
  currencyCode?: string;
  isNew?: boolean;
  isDeleted?: boolean;
}

export default function ItemPricingModal({ isOpen, onClose, item }: Props) {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sellingPrices, setSellingPrices] = useState<PriceRow[]>([]);
  const [purchasePrices, setPurchasePrices] = useState<PriceRow[]>([]);

  useEffect(() => {
    if (isOpen && item) {
      fetchData();
    }
  }, [isOpen, item]);

  const fetchData = async () => {
    if (!item) return;
    setLoading(true);
    try {
      // 1. Fetch all active Price Lists
      const plResponse = await getPriceLists({ unpaginated: true });
      const allPriceLists = plResponse.data;
      setPriceLists(allPriceLists);

      // 2. Fetch existing prices for this item
      const ipResponse = await getItemPrices({ item_id: item.id, unpaginated: true });
      const existingPrices: ItemPrice[] = ipResponse.data;

      // 3. Transform to rows
      const sRows: PriceRow[] = [];
      const pRows: PriceRow[] = [];

      existingPrices.forEach((ip) => {
        const pl = allPriceLists.find((p: PriceList) => p.id === ip.price_list_id);
        const row: PriceRow = {
          uniqueId: `existing-${ip.id}`,
          id: ip.id,
          price_list_id: String(ip.price_list_id),
          price: String(ip.price),
          min_quantity: String(ip.min_quantity || 1),
          priceListName: pl ? pl.name : 'Unknown',
          currencyCode: pl?.currency?.code || '',
        };

        if (pl?.type === 'sales') {
          sRows.push(row);
        } else if (pl?.type === 'purchase') {
          pRows.push(row);
        } else {
          // Fallback if type not found, maybe check logic or default
          if (pl) {
            if (pl.type === 'sales') sRows.push(row);
            else pRows.push(row);
          }
        }
      });

      setSellingPrices(sRows);
      setPurchasePrices(pRows);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast.error('Failed to load specific pricing data');
    } finally {
      setLoading(false);
    }
  };

  // Selling Price Handlers
  const handleAddSellingRow = () => {
    setSellingPrices([
      ...sellingPrices,
      {
        uniqueId: `new-s-${Date.now()}`,
        price_list_id: '',
        price: '',
        min_quantity: '1',
        isNew: true,
      },
    ]);
  };

  const handleDeleteSellingRow = (index: number) => {
    const newRows = [...sellingPrices];
    if (newRows[index].id) {
      newRows[index].isDeleted = true;
      setSellingPrices(newRows);
    } else {
      newRows.splice(index, 1);
      setSellingPrices(newRows);
    }
  };

  const handleUpdateSellingRow = (index: number, field: keyof PriceRow, value: string) => {
    const newRows = [...sellingPrices];
    newRows[index] = { ...newRows[index], [field]: value };
    setSellingPrices(newRows);
  };

  // Purchase Price Handlers
  const handleAddPurchaseRow = () => {
    setPurchasePrices([
      ...purchasePrices,
      {
        uniqueId: `new-p-${Date.now()}`,
        price_list_id: '',
        price: '',
        min_quantity: '1',
        isNew: true,
      },
    ]);
  };

  const handleDeletePurchaseRow = (index: number) => {
    const newRows = [...purchasePrices];
    if (newRows[index].id) {
      newRows[index].isDeleted = true;
      setPurchasePrices(newRows);
    } else {
      newRows.splice(index, 1);
      setPurchasePrices(newRows);
    }
  };

  const handleUpdatePurchaseRow = (index: number, field: keyof PriceRow, value: string) => {
    const newRows = [...purchasePrices];
    newRows[index] = { ...newRows[index], [field]: value };
    setPurchasePrices(newRows);
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const allRows = [...sellingPrices, ...purchasePrices];
      const promises = allRows.map(async (row) => {
        // Case 1: Existing row marked for deletion
        if (row.id && row.isDeleted) {
          return deleteItemPrice(row.id);
        }

        // Case 2: New row marked for deletion (do nothing)
        if (row.isNew && row.isDeleted) {
          return Promise.resolve();
        }

        // Validate
        const numericPrice = Number(row.price);
        const numericMinQty = Number(row.min_quantity) || 1;

        if (isNaN(numericPrice) || row.price === '' || !row.price_list_id) {
          // Skip incomplete rows usually, unless strict validation needed
          return Promise.resolve();
        }

        const payload = {
          price_list_id: Number(row.price_list_id),
          item_id: item.id,
          min_quantity: numericMinQty,
          price: numericPrice,
        };

        // Case 3: Create
        if (row.isNew && !row.isDeleted) {
          return createItemPrice(payload);
        }

        // Case 4: Update
        if (row.id && !row.isDeleted) {
          return updateItemPrice(row.id, payload);
        }

        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success('Prices updated successfully');
      onClose();
    } catch (error) {
      console.error('Error saving prices:', error);
      toast.error('Failed to save prices');
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[900px] p-6">
      <div className="flex flex-col h-[80vh]">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Manage Pricing: {item.name}
          </h3>
          <p className="text-sm text-gray-500">
            {item.sku} • {item.unit?.name ?? 'Unit'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-1">
          {/* Selling Prices Section */}
          <CollapsibleSection
            title="Selling Prices"
            defaultOpen={true}
            rightElement={
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSellingRow();
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Plus size={16} className="text-brand-600 dark:text-brand-400" />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <div className="space-y-3 min-w-[500px] pb-2">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
                  <div className="col-span-5">Price List</div>
                  <div className="col-span-2 text-center">Currency</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Min Qty</div>
                  <div className="col-span-1"></div>
                </div>
                {sellingPrices.map((row, index) => {
                  if (row.isDeleted) return null;
                  const selectedPl = priceLists.find((pl) => String(pl.id) === row.price_list_id);
                  return (
                    <div key={row.uniqueId} className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-5">
                        <Select
                          options={priceLists
                            .filter((pl) => pl.type === 'sales')
                            .map((pl) => ({ value: String(pl.id), label: pl.name }))}
                          value={row.price_list_id}
                          onChange={(val) => handleUpdateSellingRow(index, 'price_list_id', val)}
                          placeholder="Select List"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2 py-2 text-sm text-center text-gray-700 dark:text-gray-300">
                        {selectedPl?.currency?.code || '-'}
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500 text-sm">
                            {selectedPl?.currency?.symbol || ''}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.price}
                            onChange={(e) => handleUpdateSellingRow(index, 'price', e.target.value)}
                            className={`w-full h-10 pl-7 pr-3 rounded-lg border bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-colors border-gray-200 dark:border-white/10`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={row.min_quantity}
                          onChange={(e) =>
                            handleUpdateSellingRow(index, 'min_quantity', e.target.value)
                          }
                          className={`w-full h-10 px-3 rounded-lg border bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-colors border-gray-200 dark:border-white/10`}
                          placeholder="1"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center py-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteSellingRow(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleSection>

          {/* Purchase Prices Section */}
          <CollapsibleSection
            title="Purchase Prices"
            defaultOpen={true}
            rightElement={
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddPurchaseRow();
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Plus size={16} className="text-brand-600 dark:text-brand-400" />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <div className="space-y-3 min-w-[500px] pb-2">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
                  <div className="col-span-5">Price List</div>
                  <div className="col-span-2 text-center">Currency</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Min Qty</div>
                  <div className="col-span-1"></div>
                </div>
                {purchasePrices.map((row, index) => {
                  if (row.isDeleted) return null;
                  const selectedPl = priceLists.find((pl) => String(pl.id) === row.price_list_id);
                  return (
                    <div key={row.uniqueId} className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-5">
                        <Select
                          options={priceLists
                            .filter((pl) => pl.type === 'purchase')
                            .map((pl) => ({ value: String(pl.id), label: pl.name }))}
                          value={row.price_list_id}
                          onChange={(val) => handleUpdatePurchaseRow(index, 'price_list_id', val)}
                          placeholder="Select List"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2 py-2 text-sm text-center text-gray-700 dark:text-gray-300">
                        {selectedPl?.currency?.code || '-'}
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500 text-sm">
                            {selectedPl?.currency?.symbol || ''}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.price}
                            onChange={(e) =>
                              handleUpdatePurchaseRow(index, 'price', e.target.value)
                            }
                            className={`w-full h-10 pl-7 pr-3 rounded-lg border bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-colors border-gray-200 dark:border-white/10`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={row.min_quantity}
                          onChange={(e) =>
                            handleUpdatePurchaseRow(index, 'min_quantity', e.target.value)
                          }
                          className={`w-full h-10 px-3 rounded-lg border bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-colors border-gray-200 dark:border-white/10`}
                          placeholder="1"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center py-2">
                        <button
                          type="button"
                          onClick={() => handleDeletePurchaseRow(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleSection>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
