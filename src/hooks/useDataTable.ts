import { useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
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
  staleTime?: number;
}

export function useDataTable<T>({
  fetchData,
  initialSortBy = 'created_at',
  initialSortDirection = 'desc',
  initialPerPage = 10,
  extraParams = {},
  enabled = true,
  staleTime = 0,
}: DataTableOptions<T>) {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeFrom, setRangeFrom] = useState<number | ''>('');
  const [rangeTo, setRangeTo] = useState<number | ''>('');
  const [viewMode, setViewMode] = useState<'active' | 'trashed'>('active');

  // Debounced Values
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedRangeFrom = useDebounce(rangeFrom, 1000);
  const debouncedRangeTo = useDebounce(rangeTo, 1000);

  // Memoize extraParams
  const extraParamsString = JSON.stringify(extraParams);
  const memoizedExtraParams = useMemo(
    () => extraParams,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extraParamsString]
  );

  // Query Key Construction
  const queryKey = [
    'dataTable',
    {
      page: currentPage,
      perPage,
      sortBy,
      sortDirection,
      search: debouncedSearchTerm,
      rangeFrom: debouncedRangeFrom,
      rangeTo: debouncedRangeTo,
      viewMode,
      ...memoizedExtraParams,
    },
  ];

  // React Query Implementation
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      return await fetchData({
        page: currentPage,
        perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search: debouncedSearchTerm,
        from: debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined,
        to: debouncedRangeTo !== '' ? Number(debouncedRangeTo) : undefined,
        trashed: viewMode === 'trashed' ? 'only' : undefined,
        ...memoizedExtraParams,
        signal,
      });
    },
    enabled: enabled,
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
    staleTime: staleTime, // Default to 0 for fresh data
  });

  // Handlers
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

  // Derived Values from Query Data
  const data = response?.data || [];
  const meta = response?.meta || {
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
  };

  return {
    data,
    loading: isLoading || isFetching,
    currentPage: meta.current_page || currentPage,
    perPage,
    totalPages: meta.last_page || 1,
    total: meta.total || 0,
    from: meta.from || 0,
    to: meta.to || 0,
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
    refresh: refetch, // Alias refetch to refresh for backward compatibility
  };
}
