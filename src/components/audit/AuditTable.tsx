'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import Badge from '../ui/badge/Badge';
import { formatLabel } from '../../utils/string';
import { Eye } from 'lucide-react';
import Button from '../ui/button/Button';
import Tooltip from '../ui/tooltip/Tooltip';
import { useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';

interface AuditEntry {
  id: number;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: string | number;
  causer_type: string;
  causer_id: number;
  event: string;
  properties: any;
  created_at: string;
  updated_at: string;
  causer?: {
    name: string;
  };
  subject?: {
    name?: string;
    id?: string | number;
  };
}

interface Props {
  data: AuditEntry[];
  currentPage: number;
  perPage: number;
  onViewDetails: (entry: AuditEntry) => void;
  startIndex?: number;
}

export default function AuditTable({
  data,
  currentPage,
  perPage,
  onViewDetails,
  startIndex,
}: Props) {
  const settingsContext = useContext(SettingsContext);
  const formatDateTime =
    settingsContext?.formatDateTime || ((date: string | Date) => new Date(date).toLocaleString());

  const getEventColor = (event: string) => {
    switch (event) {
      case 'created':
        return 'success';
      case 'updated':
        return 'warning';
      case 'deleted':
        return 'error';
      case 'restored':
        return 'info';
      default:
        return 'light';
    }
  };

  const formatSubject = (type: string) => {
    if (!type) return 'System';
    const parts = type.split('\\');
    return parts[parts.length - 1];
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                User
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Event
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Subject
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Description
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((entry, index) => (
              <TableRow key={entry.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {startIndex !== undefined
                      ? startIndex + index
                      : (currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  {entry.causer?.name || 'System'}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-theme-sm">
                  <Badge size="sm" color={getEventColor(entry.event)}>
                    {entry.event}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  <span className="font-medium">{formatSubject(entry.subject_type)}</span>
                  {entry.subject?.name && (
                    <span className="block text-xs text-gray-500">{entry.subject.name}</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400 max-w-[200px] truncate">
                  {entry.description}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  {formatDateTime(entry.created_at)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Tooltip text="View Details">
                      <Button
                        size="xs"
                        onClick={() => onViewDetails(entry)}
                        className="bg-brand-500 hover:bg-brand-600 text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
