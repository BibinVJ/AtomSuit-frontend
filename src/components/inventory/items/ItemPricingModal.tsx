'use client';

import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../ui/modal';
import Button from '../../ui/button/Button';
import Input from '../../form/input/InputField';
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
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Select from '../../form/Select';
import { Trash2, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
}

interface PriceRow {
  uniqueId: string; // Temporary ID for React keys
  priceListId: number;
  priceListName: string;
  priceListType: string;
  currencyCode: string;
  itemPriceId?: number; // Backend ID
  price: number | string;
  minQuantity: number | string;
  isNew?: boolean;
  isDeleted?: boolean; // For tracking removals before save
}

export default function ItemPricingModal({ isOpen, onClose, item }: Props) {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<PriceRow[]>([]);

  // For adding new row
  const [selectedPriceListId, setSelectedPriceListId] = useState<string>('');

  useEffect(() => {
    if (isOpen && item) {
      fetchData();
      setSelectedPriceListId('');
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
      const initialRows: PriceRow[] = existingPrices.map((ip: ItemPrice) => {
        const pl = allPriceLists.find((p: PriceList) => p.id === ip.price_list_id);
        return {
          uniqueId: `existing-${ip.id}`,
          priceListId: ip.price_list_id,
          priceListName: pl ? pl.name : 'Unknown List',
          priceListType: pl ? pl.type : 'sales',
          currencyCode: pl?.currency?.code || '',
          itemPriceId: ip.id,
          price: ip.price,
          minQuantity: ip.min_quantity,
        };
      });

      setRows(initialRows);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast.error('Failed to load specific pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (uniqueId: string, val: string) => {
    setRows((prev) =>
      prev.map((row) => (row.uniqueId === uniqueId ? { ...row, price: val } : row))
    );
  };

  const handleDeleteRow = (uniqueId: string) => {
    setRows((prev) =>
      prev.map((row) => (row.uniqueId === uniqueId ? { ...row, isDeleted: true } : row))
    );
  };

  const handleRestoreRow = (uniqueId: string) => {
    setRows((prev) =>
      prev.map((row) => (row.uniqueId === uniqueId ? { ...row, isDeleted: false } : row))
    );
  };

  const handleAddRow = () => {
    if (!selectedPriceListId) return;

    const pl = priceLists.find((p) => String(p.id) === selectedPriceListId);
    if (!pl) return;

    const newRow: PriceRow = {
      uniqueId: `new-${Date.now()}`,
      priceListId: pl.id,
      priceListName: pl.name,
      priceListType: pl.type,
      currencyCode: pl.currency?.code || '',
      price: '',
      minQuantity: 1,
      isNew: true,
    };

    setRows([...rows, newRow]);
    setSelectedPriceListId('');
  };

  const availablePriceLists = useMemo(() => {
    const activeRowIds = new Set(rows.filter((r) => !r.isDeleted).map((r) => r.priceListId));
    return priceLists.filter((pl) => !activeRowIds.has(pl.id));
  }, [priceLists, rows]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const promises = rows.map(async (row) => {
        // Case 1: Existing row marked for deletion
        if (row.itemPriceId && row.isDeleted) {
          return deleteItemPrice(row.itemPriceId);
        }

        // Case 2: New row marked for deletion (do nothing)
        if (row.isNew && row.isDeleted) {
          return Promise.resolve();
        }

        // Validate price
        const numericPrice = Number(row.price);
        if (isNaN(numericPrice) || row.price === '') {
          // Skip invalid/empty prices unless deleting?
          // If it's existing and empty, we likely shouldn't have let it save, or delete it?
          // Let's assume emptiness -> no action or error.
          // For now, if existing and not deleted, update.
          if (!row.isNew && !row.isDeleted) {
            // If price is 0/empty, maybe delete? Or allow 0 free?
            // Let's allow 0, but not empty string if user intended to save.
            if (row.price === '') return Promise.resolve();
          } else {
            return Promise.resolve();
          }
        }

        const payload = {
          price_list_id: row.priceListId,
          item_id: item.id,
          min_quantity: 1,
          price: numericPrice,
        };

        // Case 3: Create
        if (row.isNew && !row.isDeleted) {
          return createItemPrice(payload);
        }

        // Case 4: Update
        if (row.itemPriceId && !row.isDeleted) {
          // We could optimize by comparing with original, but API handles it fine
          return updateItemPrice(row.itemPriceId, payload);
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
      <div className="flex flex-col h-[70vh]">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Manage Pricing: {item.name}
          </h3>
          <p className="text-sm text-gray-500">
            {item.sku} • {item.unit?.name ?? 'Unit'}
          </p>
        </div>

        {/* Add New Section */}
        <div className="mb-4 flex items-end gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
          <div className="flex-1">
            <Select
              options={[
                { value: '', label: 'Select Price List to Add...' },
                ...availablePriceLists.map((pl) => ({
                  value: String(pl.id),
                  label: `${pl.name} (${pl.currency?.code}) - ${pl.type}`,
                })),
              ]}
              value={selectedPriceListId}
              onChange={(val) => setSelectedPriceListId(String(val))}
              placeholder="Select Price List..."
              className="w-full"
            />
          </div>
          <Button
            onClick={handleAddRow}
            disabled={!selectedPriceListId}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Add Price
          </Button>
        </div>

        <div className="flex-1 overflow-auto border border-gray-200 rounded-xl dark:border-gray-800 bg-gray-50 dark:bg-white/[0.03]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-5 py-3">
                  Price List
                </TableCell>
                <TableCell isHeader className="px-5 py-3">
                  Type
                </TableCell>
                <TableCell isHeader className="px-5 py-3">
                  Currency
                </TableCell>
                <TableCell isHeader className="px-5 py-3">
                  Price
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-end">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    No custom prices set. Add one above.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.uniqueId}
                    className={row.isDeleted ? 'opacity-50 bg-red-50 dark:bg-red-900/10' : ''}
                  >
                    <TableCell className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                      {row.priceListName}
                      {row.isNew && (
                        <span className="ml-2 text-xs text-blue-500 font-normal">(New)</span>
                      )}
                      {row.isDeleted && (
                        <span className="ml-2 text-xs text-red-500 font-normal">(To Delete)</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <Badge
                        size="sm"
                        color={row.priceListType === 'sales' ? 'success' : 'warning'}
                      >
                        {row.priceListType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500">{row.currencyCode}</TableCell>
                    <TableCell className="px-5 py-2">
                      <div className="max-w-[150px]">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => handlePriceChange(row.uniqueId, e.target.value)}
                          placeholder="0.00"
                          className="h-9"
                          disabled={row.isDeleted}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-2 text-end">
                      {row.isDeleted ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreRow(row.uniqueId)}
                          className="h-8 text-xs"
                        >
                          Undo
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteRow(row.uniqueId)}
                          className="h-8 w-8 p-0 flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
