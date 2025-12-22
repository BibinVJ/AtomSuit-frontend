import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  rightElement?: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  rightElement,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-md border-gray-200 dark:border-gray-700 mt-4">
      <div
        className="flex items-center justify-between p-3 cursor-pointer bg-gray-50 dark:bg-gray-800/50 rounded-t-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown size={18} className="text-gray-500" />
          ) : (
            <ChevronRight size={18} className="text-gray-500" />
          )}
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h4>
        </div>
        {rightElement && <div onClick={(e) => e.stopPropagation()}>{rightElement}</div>}
      </div>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-md">
          {children}
        </div>
      )}
    </div>
  );
}
