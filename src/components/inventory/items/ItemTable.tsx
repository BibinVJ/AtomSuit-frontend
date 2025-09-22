"use client";


import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useState } from "react";
import Badge from "../../ui/badge/Badge";
import EditItemModal from "./EditItemModal";
import DeleteItemModal from "./DeleteItemModal";
import Button from "../../ui/button/Button";
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { PencilIcon, TrashBinIcon } from "../../../icons";
import Tooltip from "../../ui/tooltip/Tooltip";

import { Item } from '../../../types';

interface Props {
  data: Item[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
}

import { usePermissions } from "../../../hooks/usePermissions";

export default function ItemTable({ data, onAction, onSort, sortBy, sortDirection, currentPage, perPage }: Props) {
  const { hasPermission } = usePermissions();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
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
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('sku')}>SKU {renderSortIcon('sku')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('name')}>Name {renderSortIcon('name')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('category_id')}>Category {renderSortIcon('category_id')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('unit_id')}>Unit {renderSortIcon('unit_id')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('type')}>Type {renderSortIcon('type')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('selling_price')}>Selling Price {renderSortIcon('selling_price')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('is_active')}>Status {renderSortIcon('is_active')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {(currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.sku}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{item.name}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{item.category.name}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{item.unit.name} ({item.unit.code})</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{item.type}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{item.selling_price}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color={item.is_active ? "success" : "error"}>
                    {item.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {hasPermission("update-item") && (
                      <Tooltip text="Edit">
                        <Button
                          size="xs"
                          onClick={() => handleEdit(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                    {hasPermission("delete-item") && (
                      <Tooltip text="Delete">
                        <Button
                          size="xs"
                          onClick={() => handleDelete(item)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <TrashBinIcon className="w-4 h-4" />
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
      {selectedItem && (
        <>
          <EditItemModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onItemUpdated={onAction}
            item={selectedItem}
          />
          <DeleteItemModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onItemDeleted={onAction}
            item={selectedItem}
          />
        </>
      )}
    </div>
  );
}