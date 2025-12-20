import React from 'react';
import Tooltip from '../ui/tooltip/Tooltip';

interface ViewModeTabsProps {
  viewMode: 'active' | 'trashed';
  setViewMode: (mode: 'active' | 'trashed') => void;
}

const ViewModeTabs: React.FC<ViewModeTabsProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mr-2">
      <Tooltip text="Show Active Items">
        <button
          type="button"
          onClick={() => setViewMode('active')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            viewMode === 'active'
              ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Active
        </button>
      </Tooltip>
      <Tooltip text="Show Trashed Items">
        <button
          type="button"
          onClick={() => setViewMode('trashed')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            viewMode === 'trashed'
              ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Trashed
        </button>
      </Tooltip>
    </div>
  );
};

export default ViewModeTabs;
