'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { ReactNode, useState, useRef, useEffect } from 'react';

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  percentage?: number;
  trend?: 'up' | 'down';
}

const MetricCard = ({ icon, title, value, percentage, trend }: MetricCardProps) => {
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setHeight(entries[0].contentRect.height);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Threshold for switching to the compact, horizontal layout
  const isCompact = height < 110;

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-gray-200 custom-card-bg p-4 md:p-5 flex h-full w-full dark:border-gray-800 ${
        isCompact ? 'flex-row items-center' : 'flex-col'
      }`}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>
      <div className={`flex items-end justify-between w-full ${isCompact ? 'ml-4' : 'mt-auto'}`}>
        <div>
          <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{title}</span>
          <h4 className="mt-1 font-bold text-gray-800 text-lg md:text-xl dark:text-white/90">
            {value}
          </h4>
        </div>
        {trend && percentage && (
          <Badge color={trend === 'up' ? 'success' : 'error'}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {percentage}%
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
