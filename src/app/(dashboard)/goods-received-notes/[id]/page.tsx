'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import SkeletonDetail from '@/components/common/SkeletonDetail';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { GoodsReceivedNoteService } from '@/services/GoodsReceivedNoteService';
import { useSettings } from '@/hooks/useSettings';
import { GoodsReceivedNote, GoodsReceivedNoteStatus } from '@/types/GoodsReceivedNote';
import { toast } from 'sonner';

export default function ViewGoodsReceivedNote() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { formatCurrency, formatQuantity, formatDate } = useSettings();
  const [grn, setGrn] = useState<GoodsReceivedNote | null>(null);

  const fetchGrnDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await GoodsReceivedNoteService.get(id as string);
        setGrn(response);
      }
    } catch (error) {
      console.error('Error fetching GRN details:', error);
      toast.error('Failed to load goods received note details');
      router.push('/goods-received-notes');
    }
  }, [id, router]);

  useEffect(() => {
    fetchGrnDetails();
  }, [fetchGrnDetails]);

  const taxBreakdown = useMemo(() => {
    if (!grn?.items) return [];
    const taxMap: Record<string, number> = {};
    grn.items.forEach((item) => {
      if (item.tax_meta?.rates) {
        const taxableAmount = (item.sub_total || 0) - (item.discount_amount || 0);
        item.tax_meta.rates.forEach((rate) => {
          let amount = 0;
          if (rate.type === 'percentage') {
            amount = taxableAmount * (Number(rate.rate) / 100);
          } else {
            const qty = item.accepted_quantity || 0;
            amount = Number(rate.rate) * qty;
          }
          taxMap[rate.name] = (taxMap[rate.name] || 0) + amount;
        });
      }
    });
    return Object.entries(taxMap).map(([name, amount]) => ({ name, amount }));
  }, [grn?.items]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: GoodsReceivedNoteStatus) => {
    switch (status) {
      case GoodsReceivedNoteStatus.RECEIVED:
        return 'success';
      case GoodsReceivedNoteStatus.VOIDED:
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (!grn) {
    return (
      <>
        <PageBreadcrumb
          pageTitle="Goods Received Note Details"
          breadcrumbs={[{ label: 'Goods Received Notes', path: '/goods-received-notes' }]}
          backButton={true}
        />
        <SkeletonDetail columns={3} />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`Goods Received Note #${grn.grn_number}`}
        description="View goods received note details"
      />
      <PageBreadcrumb
        pageTitle="Goods Received Note Details"
        breadcrumbs={[{ label: 'Goods Received Notes', path: '/goods-received-notes' }]}
        backButton={true}
      />

      <div className="flex justify-end gap-2 mb-4">
        {[GoodsReceivedNoteStatus.RECEIVED].includes(grn.status) && !grn.is_fully_invoiced && (
          <Button
            variant="primary"
            size="sm"
            href={`/purchase-invoices/create?grn_id=${grn.id}&purchase_order_id=${grn.purchase_order_id || ''}`}
          >
            Convert to PI
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handlePrint}>
          Print
        </Button>
      </div>

      <ComponentCard title={`Goods Received Note #${grn.grn_number}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Vendor Details</h3>
              <p className="dark:text-gray-400">
                <strong>Name:</strong> {grn.vendor?.name}
              </p>
              <p className="dark:text-gray-400">
                <strong>Email:</strong> {grn.vendor?.email}
              </p>
              <p className="dark:text-gray-400">
                <strong>Phone:</strong> {grn.vendor?.phone}
              </p>
              {grn.vendor?.billing_address_line_1 && (
                <p className="dark:text-gray-400">
                  <strong>Address:</strong>
                  <span className="block">
                    {grn.vendor.billing_address_line_1}
                    {grn.vendor.billing_city && `, ${grn.vendor.billing_city}`}
                    {grn.vendor.billing_state && `, ${grn.vendor.billing_state}`}
                    {grn.vendor.billing_country && `, ${grn.vendor.billing_country}`}
                    {grn.vendor.billing_zip_code && ` - ${grn.vendor.billing_zip_code}`}
                  </span>
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">GRN Details</h3>
              <p className="dark:text-gray-400">
                <strong>GRN #:</strong> {grn.grn_number}
              </p>
              {grn.reference_number && (
                <p className="dark:text-gray-400">
                  <strong>Reference #:</strong> {grn.reference_number}
                </p>
              )}
              <p className="dark:text-gray-400">
                <strong>Received Date:</strong> {formatDate(grn.received_date)}
              </p>
              <p className="dark:text-gray-400">
                <strong>Status:</strong>
                <Badge size="sm" color={getStatusColor(grn.status)}>
                  {grn.status}
                </Badge>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Additional Info</h3>
              {grn.cost_center && (
                <p className="dark:text-gray-400">
                  <strong>Cost Center:</strong> {grn.cost_center.name}
                </p>
              )}
              {grn.warehouse && (
                <p className="dark:text-gray-400">
                  <strong>Warehouse:</strong> {grn.warehouse.name}
                </p>
              )}
              {grn.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong>
                  <p className="text-sm dark:text-gray-400 mt-1 whitespace-pre-wrap border p-2 rounded bg-gray-50 dark:bg-gray-800">
                    {grn.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Item
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Description
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Qty Rcvd
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Qty Accpt
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Unit Price
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Tax
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Total Amount
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {grn.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.item?.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.description || '-'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatQuantity(item.quantity_received ?? 0)} {item.item?.unit?.code}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatQuantity(item.accepted_quantity ?? 0)} {item.item?.unit?.code}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(item.unit_price ?? 0)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {item.tax_meta?.rates?.length ? (
                          <div className="flex flex-col items-end space-y-0.5">
                            {item.tax_meta.rates.map((rate, i) => (
                              <div key={i} className="text-xs whitespace-nowrap">
                                {rate.name}{' '}
                                <span className="font-medium text-gray-500">
                                  ({rate.rate}
                                  {rate.type === 'percentage' ? '%' : ''})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(item.total_amount ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Sub Total</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(grn.sub_total)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Discount</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  -{formatCurrency(grn.discount_total)}
                </span>
              </div>
              {taxBreakdown.map((tb, idx) => (
                <div key={idx} className="flex justify-between items-center px-4">
                  <span className="text-gray-500 font-bold uppercase text-theme-xs">{tb.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    +{formatCurrency(tb.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Total Tax</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  +{formatCurrency(grn.tax_total)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
                <span className="text-brand-600 dark:text-brand-400 font-bold uppercase text-theme-sm">
                  Total Amount
                </span>
                <span className="text-xl font-black text-brand-700 dark:text-brand-400">
                  {formatCurrency(grn.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
