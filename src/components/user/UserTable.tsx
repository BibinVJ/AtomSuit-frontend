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
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import Button from "../ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import Tooltip from "../ui/tooltip/Tooltip";
import { formatKebabCase } from "../../utils/string";
import { User } from "../../types";

interface Props {
  data: User[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
}

export default function UserTable({ data, onAction, onSort, sortBy, sortDirection, currentPage, perPage }: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(
    null
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
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
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('name')}>Name {renderSortIcon('name')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('email')}>Email {renderSortIcon('email')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('phone')}>Phone {renderSortIcon('phone')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('status')}>Status {renderSortIcon('status')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {(currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{user.name}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{user.email}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{user.phone}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  {formatKebabCase(user.role.name)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color={user.status === 'active' ? "success" : "error"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Tooltip text="Edit">
                      <Button
                        size="xs"
                        onClick={() => handleEdit(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip text="Delete">
                      <Button
                        size="xs"
                        onClick={() => handleDelete(user)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedUser && (
        <>
          <EditUserModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onUserUpdated={onAction}
            user={selectedUser}
          />
          <DeleteUserModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onUserDeleted={onAction}
            user={selectedUser}
          />
        </>
      )}
    </div>
  );
}
