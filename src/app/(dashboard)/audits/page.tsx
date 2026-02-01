'use client';

import { useState, useMemo } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import AuditTable from './_components/AuditTable';
import AuditDetailsModal from './_components/AuditDetailsModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Select from '@/components/form/Select';
import AuditService from '@/services/AuditService';
import { AuditEntry } from '@/types';
import { useDataTable } from '@/hooks/useDataTable';
import TableToolbar from '@/components/common/TableToolbar';

export default function Audits() {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedSubjectType, setSelectedSubjectType] = useState('');

  const extraParams = useMemo(
    () => ({
      event: selectedEvent,
      subject_type: selectedSubjectType,
    }),
    [selectedEvent, selectedSubjectType]
  );

  const {
    data: activities,
    currentPage,
    perPage,
    totalPages,
    total,
    from,
    to,
    searchTerm,
    setSearchTerm,
    handlePageChange,
    handlePerPageChange,
    resetFilters,
  } = useDataTable<AuditEntry>({
    fetchData: AuditService.getActivities,
    initialPerPage: 20,
    extraParams,
  });

  const handleViewDetails = (entry: AuditEntry) => {
    setSelectedEntry(entry);
    openModal();
  };

  return (
    <>
      <PageMeta title="Audit Logs" description="System activity and audit trail" />
      <PageBreadcrumb pageTitle="Audit Logs" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search logs..."
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={() => {
              resetFilters();
              setSelectedEvent('');
              setSelectedSubjectType('');
            }}
            extraFilters={
              <>
                <div className="w-full md:w-36">
                  <Select
                    options={[
                      { value: '', label: 'All Events' },
                      { value: 'created', label: 'Created' },
                      { value: 'updated', label: 'Updated' },
                      { value: 'deleted', label: 'Deleted' },
                      { value: 'restored', label: 'Restored' },
                    ]}
                    onChange={(value) => setSelectedEvent(value)}
                    defaultValue={selectedEvent}
                    placeholder="Event"
                    className="w-full"
                    searchable={false}
                  />
                </div>
                <div className="w-full md:w-40">
                  <Select
                    options={[
                      { value: '', label: 'All Subjects' },
                      { value: 'App\\Models\\User', label: 'User' },
                      { value: 'App\\Models\\Item', label: 'Item' },
                      { value: 'App\\Models\\Sale', label: 'Sale' },
                      { value: 'App\\Models\\Purchase', label: 'Purchase' },
                      { value: 'App\\Models\\Category', label: 'Category' },
                      { value: 'App\\Models\\Unit', label: 'Unit' },
                      { value: 'App\\Models\\Customer', label: 'Customer' },
                      { value: 'App\\Models\\Vendor', label: 'Vendor' },
                    ]}
                    onChange={(value) => setSelectedSubjectType(value)}
                    defaultValue={selectedSubjectType}
                    placeholder="Subject"
                    className="w-full"
                    searchable={false}
                  />
                </div>
              </>
            }
          />
        </div>

        <ComponentCard title="Activity Log">
          <AuditTable
            data={activities}
            currentPage={currentPage}
            perPage={perPage}
            onViewDetails={handleViewDetails}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            from={from}
            to={to}
            total={total}
          />
        </ComponentCard>
      </div>

      <AuditDetailsModal isOpen={isOpen} onClose={closeModal} entry={selectedEntry} />
    </>
  );
}
