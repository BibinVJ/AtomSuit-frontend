"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import Badge from "../ui/badge/Badge";
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide, View, Edit, Trash2 } from 'lucide-react';
import Button from "../ui/button/Button";
import Tooltip from "../ui/tooltip/Tooltip";
import { useRouter } from "next/navigation";
import VoidSaleModal from "./VoidSaleModal";

import { Sale } from '../../types';

interface Props {
  data: Sale[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
}

import { usePermissions } from "../../hooks/usePermissions";

export default function SaleTable({ data, onAction, onSort, sortBy, sortDirection, currentPage, perPage }: Props) {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const handleView = (id: number) => {
    router.push(`/sales/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/sales/edit/${id}`);
  };

  const handleDelete = (sale: Sale) => {
    setSelectedSale(sale);
    setIsVoidModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsVoidModalOpen(false);
    setSelectedSale(null);
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronsUpDown className="inline-block w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpWideNarrow className="inline-block w-4 h-4 ml-1" />
    ) : (
      <ArrowDownNarrowWide className="inline-block w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('invoice_number')}>Invoice # {renderSortIcon('invoice_number')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('sale_date')}>Sale Date {renderSortIcon('sale_date')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('customer_id')}>Customer {renderSortIcon('customer_id')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('total_amount')}>Total Amount {renderSortIcon('total_amount')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('status')}>Status {renderSortIcon('status')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((sale, index) => (
              <TableRow key={sale.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {(currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{sale.invoice_number}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{sale.sale_date}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{sale.customer.name}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{sale.total_amount}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color={sale.status === 'completed' ? 'success' : (sale.status === 'voided' ? 'error' : 'primary')}>
                    {sale.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {hasPermission("view-sale") && (
                      <Tooltip text="View">
                        <Button
                          size="xs"
                          onClick={() => handleView(sale.id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          <View className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                    {hasPermission("update-sale") && (
                      <Tooltip text="Edit">
                        <Button
                          size="xs"
                          onClick={() => handleEdit(sale.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                    {hasPermission("delete-sale") && (
                      <Tooltip text="Void">
                        <Button
                          size="xs"
                          onClick={() => handleDelete(sale)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedSale && (
        <VoidSaleModal
          isOpen={isVoidModalOpen}
          onClose={handleCloseModal}
          onSaleVoided={onAction}
          sale={selectedSale}
        />
      )}
    </div>
  );
}