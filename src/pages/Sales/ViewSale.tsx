"use client";


import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import VoidSaleModal from '../../components/sales/VoidSaleModal';
import { getSale } from '../../services/SaleService';

import { Sale } from '../../types';

export default function ViewSale() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        if (id) {
          const response = await getSale(id);
          setSale(response.data);
        }
      } catch (error) {
        console.error('Error fetching sale details:', error);
      }
    };
    fetchSaleDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleVoidSuccess = () => {
    router.push('/sales');
  };

  if (!sale) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageMeta
        title={`Sale #${sale.invoice_number}`}
        description="View sale details"
      />
      <PageBreadcrumb
        pageTitle="Sale Details"
        breadcrumbs={[
          { label: 'Sales', path: '/sales' },
        ]}
        backButton={true}
      />

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" onClick={() => router.push(`/sales/edit/${id}`)}>Edit</Button>
        <Button variant="outline" onClick={handlePrint}>Print</Button>
        <Button variant="outline" onClick={() => setIsVoidModalOpen(true)}>Void</Button>
      </div>

      <ComponentCard title={`Sale #${sale.invoice_number}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Customer Details</h3>
              <p className="dark:text-gray-400">Name: <strong>{sale.customer.name}</strong></p>
              <p className="dark:text-gray-400">Email: <strong>{sale.customer.email}</strong></p>
              <p className="dark:text-gray-400">Phone: <strong>{sale.customer.phone}</strong></p>
              <p className="dark:text-gray-400">Address: <strong>{sale.customer.address}</strong></p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Sale Details</h3>
              <p className="dark:text-gray-400">Invoice #: <strong>{sale.invoice_number}</strong></p>
              <p className="dark:text-gray-400">Sale Date: <strong>{sale.sale_date}</strong></p>
              <p className="dark:text-gray-400">Entered By: <strong>{sale.user.name}</strong></p>
              <p className="dark:text-gray-400">Status: <strong>
                <Badge size="sm" color={sale.status === 'completed' ? 'success' : (sale.status === 'voided' ? 'error' : 'primary')}>
                  {sale.status}
                </Badge>
              </strong></p>
              <p className="dark:text-gray-400">Payment Method: <strong>{sale.payment_method}</strong></p>
              <p className="dark:text-gray-400">Note: <strong>{sale.note}</strong></p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Item</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Quantity</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Unit Price</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Total Price</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {sale.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">{item.item.name}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">{item.quantity}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">{item.unit_price}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">{item.quantity * item.unit_price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <tfoot className="border-t border-gray-100 dark:border-white/[0.05]">
                  <TableRow className="font-semibold">
                    <TableCell colSpan={3} className="px-5 py-4 text-end text-gray-800 dark:text-white/90">Total Amount:</TableCell>
                    <TableCell className="px-5 py-4 text-end text-gray-800 dark:text-white/90">{sale.total_amount}</TableCell>
                  </TableRow>
                </tfoot>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>

      {sale && (
        <VoidSaleModal
          isOpen={isVoidModalOpen}
          onClose={() => setIsVoidModalOpen(false)}
          onSaleVoided={handleVoidSuccess}
          sale={sale}
        />
      )}
    </>
  );
}
