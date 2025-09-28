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
import VoidPurchaseModal from "./VoidPurchaseModal";

import { Purchase } from '../../types';

interface Props {
  data: Purchase[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
}

import { usePermissions } from "../../hooks/usePermissions";

export default function PurchaseTable({ data, onAction, onSort, sortBy, sortDirection, currentPage, perPage }: Props) {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const handleView = (id: number) => {
    router.push(`/purchases/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/purchases/edit/${id}`);
  };

  const handleDelete = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsVoidModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsVoidModalOpen(false);
    setSelectedPurchase(null);
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
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('purchase_date')}>Purchase Date {renderSortIcon('purchase_date')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('vendor_id')}>Vendor {renderSortIcon('vendor_id')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('total_amount')}>Total Amount {renderSortIcon('total_amount')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('payment_status')}>Payment Status {renderSortIcon('payment_status')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((purchase, index) => (
              <TableRow key={purchase.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {(currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{purchase.invoice_number}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{purchase.purchase_date}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{purchase.vendor.name}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{purchase.total_amount}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color={purchase.payment_status === 'paid' ? "success" : "warning"}>
                    {purchase.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {hasPermission("view-purchase") && (
                      <Tooltip text="View">
                        <Button
                          size="xs"
                          onClick={() => handleView(purchase.id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          <View className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                    {hasPermission("update-purchase") && (
                      <Tooltip text="Edit">
                        <Button
                          size="xs"
                          onClick={() => handleEdit(purchase.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                    {hasPermission("delete-purchase") && (
                      <Tooltip text="Void">
                        <Button
                          size="xs"
                          onClick={() => handleDelete(purchase)}
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
      {selectedPurchase && (
        <VoidPurchaseModal
          isOpen={isVoidModalOpen}
          onClose={handleCloseModal}
          onPurchaseVoided={onAction}
          purchase={selectedPurchase}
        />
      )}
    </div>
  );
}
