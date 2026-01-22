import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface DataTableOptions<T> {
  fetchData: (params: Record<string, unknown>) => Promise<{
    data: T[];
    meta?: {
      current_page: number;
      last_page: number;
      from: number | null;
      to: number | null;
      total: number;
    };
  }>;
  initialSortBy?: string;
  initialSortDirection?: 'asc' | 'desc';
  initialPerPage?: number;
  extraParams?: Record<string, unknown>;
  enabled?: boolean;
}

export function useDataTable<T>({
  fetchData,
  initialSortBy = 'created_at',
  initialSortDirection = 'desc',
  initialPerPage = 10,
  extraParams = {},
  enabled = true,
}: DataTableOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeFrom, setRangeFrom] = useState<number | ''>('');
  const [rangeTo, setRangeTo] = useState<number | ''>('');
  const [viewMode, setViewMode] = useState<'active' | 'trashed'>('active');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedRangeFrom = useDebounce(rangeFrom, 1000);
  const debouncedRangeTo = useDebounce(rangeTo, 1000);

  // Memoize extraParams to avoid unnecessary refresh if they haven't changed
  const extraParamsString = JSON.stringify(extraParams);
  const memoizedExtraParams = useMemo(
    () => extraParams,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extraParamsString] // Use the stringified version to memoize based on value
  );

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      const response = await fetchData({
        page: currentPage,
        perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search: debouncedSearchTerm,
        from: debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined,
        to: debouncedRangeTo !== '' ? Number(debouncedRangeTo) : undefined,
        trashed: viewMode === 'trashed' ? 'only' : undefined,
        ...memoizedExtraParams,
      });

      setData(response.data);
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setCurrentPage(response.meta.current_page || 1);
        setFrom(response.meta.from || 0);
        setTo(response.meta.to || 0);
        setTotal(response.meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [
    fetchData,
    currentPage,
    perPage,
    sortBy,
    sortDirection,
    debouncedSearchTerm,
    debouncedRangeFrom,
    debouncedRangeTo,
    viewMode,
    memoizedExtraParams,
    enabled,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRangeFrom('');
    setRangeTo('');
    setCurrentPage(1);
  };

  return {
    data,
    loading,
    currentPage,
    perPage,
    totalPages,
    total,
    from,
    to,
    sortBy,
    sortDirection,
    searchTerm,
    setSearchTerm,
    rangeFrom,
    setRangeFrom,
    rangeTo,
    setRangeTo,
    viewMode,
    setViewMode,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    resetFilters,
    refresh,
  };
}
