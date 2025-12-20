
import React from 'react';
import Select from '../form/Select';
import Tooltip from '../ui/tooltip/Tooltip';

interface TableToolbarProps {
  // Search
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;

  // Range
  rangeFrom?: string | number;
  onRangeFromChange?: (value: string | number) => void;
  rangeTo?: string | number;
  onRangeToChange?: (value: string | number) => void;
  showRange?: boolean;

  // Pagination
  perPage?: number;
  onPerPageChange?: (value: string) => void;
  showPerPage?: boolean;

  // Custom Filters (Role, Status, etc.)
  extraFilters?: React.ReactNode;

  // Reset
  onReset?: () => void;

  className?: string;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  showSearch = true,
  rangeFrom,
  onRangeFromChange,
  rangeTo,
  onRangeToChange,
  showRange = true,
  perPage,
  onPerPageChange,
  showPerPage = true,
  extraFilters,
  onReset,
  className = "mb-6",
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        {showSearch && onSearchChange && (
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {/* Extra Filters (Role, Status, etc.) */}
        {extraFilters && (
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {extraFilters}
          </div>
        )}

        {/* Spacer for desktop layout */}
        <div className="hidden xl:block flex-1"></div>

        {/* Right Side: Range and Rows */}
        <div className="flex flex-wrap items-center gap-3 ml-auto xl:ml-0">
          {/* Range Inputs Group */}
          {showRange && onRangeFromChange && onRangeToChange && (
            <div className="flex items-center gap-0 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-11">
              <div className="flex items-center px-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Min</span>
              </div>
              <input
                type="number"
                className="w-16 pl-2 pr-2 py-2.5 bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none border-none placeholder-gray-400 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={rangeFrom}
                onChange={(e) => onRangeFromChange(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
              />
              <div className="h-full w-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex items-center px-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 border-l h-full">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Max</span>
              </div>
              <input
                type="number"
                className="w-16 pl-2 pr-2 py-2.5 bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none border-none placeholder-gray-400 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={rangeTo}
                onChange={(e) => onRangeToChange(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
              />
            </div>
          )}

          {/* Per Page */}
          {showPerPage && onPerPageChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium hidden lg:block">Rows:</span>
              <div className="w-20">
                <Select
                  options={[
                    { value: '10', label: '10' },
                    { value: '20', label: '20' },
                    { value: '50', label: '50' },
                  ]}
                  onChange={onPerPageChange}
                  defaultValue={String(perPage)}
                  showPlaceholder={false}
                  className="w-full"
                  searchable={false}
                />
              </div>
            </div>
          )}

          {/* Reset Button */}
          {onReset && (
            <Tooltip text="Reset Filters">
              <button
                onClick={onReset}
                className="h-[42px] px-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Divider for mobile layout when filters wrap */}
      <div className="w-full h-px bg-gray-100 dark:bg-gray-800 xl:hidden"></div>
    </div>
  );
};

export default TableToolbar;
