'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import AuditTable from '../../components/audit/AuditTable';
import AuditDetailsModal from '../../components/audit/AuditDetailsModal';
import { useModal } from '../../hooks/useModal';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/form/Select';
import { AuditService } from '../../services/AuditService';
import { AuditEntry } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import TableToolbar from '../../components/common/TableToolbar';

export default function Audits() {
  const [activities, setActivities] = useState<AuditEntry[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);

  /* State for Range Fetching & Search */
  const [rangeFrom, setRangeFrom] = useState<number | ''>('');
  const [rangeTo, setRangeTo] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const debouncedRangeFrom = useDebounce(rangeFrom, 1000);
  const debouncedRangeTo = useDebounce(rangeTo, 1000);

  /* State for Advanced Filters */
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedSubjectType, setSelectedSubjectType] = useState('');

  const fetchActivities = async (page = 1, limit = 20) => {
    try {
      const params: any = { page, limit };
      if (debouncedRangeFrom !== '' && debouncedRangeTo !== '') {
        params.from = Number(debouncedRangeFrom);
        params.to = Number(debouncedRangeTo);
      }
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      if (selectedEvent) {
        params.event = selectedEvent;
      }
      if (selectedSubjectType) {
        params.subject_type = selectedSubjectType;
      }

      const response = await AuditService.getActivities(params);

      setActivities(response.data);
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setCurrentPage(response.meta.current_page || 1);
        setFrom(
          response.meta.from !== undefined
            ? response.meta.from
            : debouncedRangeFrom !== ''
              ? Number(debouncedRangeFrom)
              : 0
        );
        setTo(
          response.meta.to !== undefined
            ? response.meta.to
            : debouncedRangeTo !== ''
              ? Number(debouncedRangeTo)
              : 0
        );
        setTotal(response.meta.total !== undefined ? response.meta.total : 0);
      } else {
        setTotalPages(1);
        setCurrentPage(1);
        setFrom(debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : 0);
        setTo(debouncedRangeTo !== '' ? Number(debouncedRangeTo) : 0);
        setTotal(response.data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
    }
  };

  useEffect(() => {
    fetchActivities(currentPage, perPage);
  }, [
    currentPage,
    perPage,
    selectedEvent,
    selectedSubjectType,
    debouncedSearchTerm,
    debouncedRangeFrom,
    debouncedRangeTo,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

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
            rangeFrom={rangeFrom}
            onRangeFromChange={(val) => setRangeFrom(val as number | '')}
            rangeTo={rangeTo}
            onRangeToChange={(val) => setRangeTo(val as number | '')}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={() => {
              setSearchTerm('');
              setSelectedEvent('');
              setSelectedSubjectType('');
              setRangeFrom('');
              setRangeTo('');
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
                    showPlaceholder={true}
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
                    showPlaceholder={true}
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
            startIndex={debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined}
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
