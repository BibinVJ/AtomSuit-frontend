'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import VoidPurchaseModal from '@/app/(dashboard)/purchases/_components/VoidPurchaseModal';
import { getPurchase } from '@/services/PurchaseService';
import { useSettings } from '@/hooks/useSettings';

import { Purchase } from '@/types';

export default function ViewPurchase() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { formatCurrency, formatDate } = useSettings();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  const fetchPurchaseDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await getPurchase(id);
        setPurchase(response);
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [fetchPurchaseDetails]);

  const handlePrint = () => {
    window.print();
  };

  const handleVoidSuccess = () => {
    router.push('/purchases');
  };

  if (!purchase) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageMeta
        title={`Purchase #${purchase.invoice_number}`}
        description="View purchase details"
      />
      <PageBreadcrumb
        pageTitle="Purchase Details"
        breadcrumbs={[{ label: 'Purchases', path: '/purchases' }]}
        backButton={true}
      />

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" onClick={() => router.push(`/purchases/${id}/edit`)}>
          Edit
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          Print
        </Button>
        <Button variant="outline" onClick={() => setIsVoidModalOpen(true)}>
          Void
        </Button>
      </div>

      <ComponentCard title={`Purchase #${purchase.invoice_number}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Vendor Details</h3>
              <p className="dark:text-gray-400">
                <strong>Name:</strong> {purchase.vendor.name}
              </p>
              <p className="dark:text-gray-400">
                <strong>Email:</strong> {purchase.vendor.email}
              </p>
              <p className="dark:text-gray-400">
                <strong>Phone:</strong> {purchase.vendor.phone}
              </p>
              <p className="dark:text-gray-400">
                <strong>Address:</strong>
                <span className="block">
                  {purchase.vendor.billing_address_line_1}
                  {purchase.vendor.billing_city && `, ${purchase.vendor.billing_city}`}
                  {purchase.vendor.billing_state && `, ${purchase.vendor.billing_state}`}
                  {purchase.vendor.billing_country && `, ${purchase.vendor.billing_country}`}
                  {purchase.vendor.billing_zip_code && ` - ${purchase.vendor.billing_zip_code}`}
                </span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Purchase Details</h3>
              <p className="dark:text-gray-400">
                <strong>Invoice #:</strong> {purchase.invoice_number}
              </p>
              <p className="dark:text-gray-400">
                <strong>Purchase Date:</strong> {formatDate(purchase.purchase_date)}
              </p>
              <p className="dark:text-gray-400">
                <strong>Payment Status:</strong>
                <Badge size="sm" color={purchase.payment_status === 'paid' ? 'success' : 'warning'}>
                  {purchase.payment_status}
                </Badge>
              </p>
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
                      Batch #
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      MFG Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Expiry Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Unit Cost
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Total Cost
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {purchase.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.item.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.batch.batch_number}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.batch.manufacture_date
                          ? formatDate(item.batch.manufacture_date)
                          : '-'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.batch.expiry_date ? formatDate(item.batch.expiry_date) : '-'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(item.unit_cost)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(item.total_cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <tfoot className="border-t border-gray-100 dark:border-white/[0.05]">
                  <TableRow className="font-semibold">
                    <TableCell
                      colSpan={6}
                      className="px-5 py-4 text-end text-gray-800 dark:text-white/90"
                    >
                      Total Amount:
                    </TableCell>
                    <TableCell className="px-5 py-4 text-end text-gray-800 dark:text-white/90">
                      {formatCurrency(purchase.total_amount)}
                    </TableCell>
                  </TableRow>
                </tfoot>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>

      {purchase && (
        <VoidPurchaseModal
          isOpen={isVoidModalOpen}
          onClose={() => setIsVoidModalOpen(false)}
          onPurchaseVoided={handleVoidSuccess}
          purchase={purchase}
        />
      )}
    </>
  );
}
