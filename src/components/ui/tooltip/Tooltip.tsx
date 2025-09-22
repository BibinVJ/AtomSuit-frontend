"use client";


import { ReactNode, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
}

export default function Tooltip({ children, text }: TooltipProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      {children}
      {isTooltipVisible && (
        <div className="absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm bottom-full left-1/2 -translate-x-1/2 dark:bg-gray-700">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700"></span>
        </div>
      )}
    </div>
  );
}
