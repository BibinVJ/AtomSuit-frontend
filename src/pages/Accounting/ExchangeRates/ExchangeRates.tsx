"use client";

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import PageMeta from '../../../components/common/PageMeta';
import ExchangeRateTable from '../../../components/accounting/exchange-rates/ExchangeRateTable';
import AddExchangeRateModal from '../../../components/accounting/exchange-rates/AddExchangeRateModal';
import { useModal } from '../../../hooks/useModal';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/ui/button/Button';
import Tooltip from '../../../components/ui/tooltip/Tooltip';
import { getExchangeRates, exportExchangeRates } from '../../../services/ExchangeRateService';
import { ExchangeRate } from '../../../types/ExchangeRate';
import { Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import TableToolbar from '../../../components/common/TableToolbar';
import { useDebounce } from '../../../hooks/useDebounce';
import ViewModeTabs from '../../../components/common/ViewModeTabs';

export default function ExchangeRates() {
    const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
    const { isOpen, openModal, closeModal } = useModal();
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [from, setFrom] = useState(0);
    const [to, setTo] = useState(0);
    const [total, setTotal] = useState(0);
    const [viewMode, setViewMode] = useState<'active' | 'trashed'>('active');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchExchangeRates = async (page = 1, limit = 10, search = '', trashed = false, sortCol = 'created_at', sortDir = 'desc') => {
        try {
            const response = await getExchangeRates({
                page,
                perPage: limit,
                search,
                trashed: trashed ? 'only' : undefined,
                sort_by: sortCol,
                sort_direction: sortDir,
            });
            setExchangeRates(response.data);
            if (response.meta) {
                setTotalPages(response.meta.last_page || 1);
                setCurrentPage(response.meta.current_page || 1);
                setFrom(response.meta.from || 0);
                setTo(response.meta.to || 0);
                setTotal(response.meta.total || 0);
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            toast.error('Failed to fetch exchange rates');
        }
    };

    useEffect(() => {
        fetchExchangeRates(currentPage, perPage, debouncedSearchTerm, viewMode === 'trashed', sortBy, sortDirection);
    }, [currentPage, perPage, debouncedSearchTerm, viewMode, sortBy, sortDirection]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(parseInt(value, 10));
        setCurrentPage(1);
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const handleExport = async () => {
        try {
            const response = await exportExchangeRates();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.setAttribute('download', `exchange_rates_${timestamp}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to export exchange rates');
            console.error('Export error:', error);
        }
    };

    return (
        <>
            <PageMeta
                title="Exchange Rates"
                description="Manage system exchange rates"
            />
            <PageBreadcrumb pageTitle="Exchange Rates" />

            <div className="space-y-6">
                <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
                    <TableToolbar
                        className="mb-0"
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search exchange rates..."
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                        onReset={() => {
                            setSearchTerm('');
                        }}
                    />
                </div>

                <ComponentCard
                    title={`Exchange Rates (${viewMode})`}
                    action={
                        <div className="flex flex-wrap items-center gap-3">
                            <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
                            <Tooltip text="Export Exchange Rates">
                                <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2 font-medium">
                                    <Download size={16} />
                                    Export
                                </Button>
                            </Tooltip>
                            <Tooltip text="Add New Exchange Rate">
                                <Button
                                    onClick={openModal}
                                    size="sm"
                                    className="flex items-center gap-2 font-medium"
                                >
                                    <Plus size={16} />
                                    Add Exchange Rate
                                </Button>
                            </Tooltip>
                        </div>
                    }
                >
                    <ExchangeRateTable
                        data={exchangeRates}
                        onAction={() => fetchExchangeRates(currentPage, perPage, debouncedSearchTerm, viewMode === 'trashed', sortBy, sortDirection)}
                        onSort={handleSort}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        currentPage={currentPage}
                        perPage={perPage}
                        viewMode={viewMode}
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
            <AddExchangeRateModal
                isOpen={isOpen}
                onClose={closeModal}
                onSuccess={() => fetchExchangeRates(1, perPage, debouncedSearchTerm, viewMode === 'trashed', sortBy, sortDirection)}
            />
        </>
    );
}
