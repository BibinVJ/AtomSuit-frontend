'use client';

import { useState, useRef, useEffect } from 'react';
import { TrendingUp, Users, Target } from 'lucide-react';

interface GrowthCardProps {
  data: {
    last_30_days: number;
    conversion_rate: string;
  };
}

export default function GrowthCard({ data }: GrowthCardProps) {
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

  const isCompact = height < 140;

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-gray-200 custom-card-bg p-4 md:p-5 flex flex-col h-full w-full dark:border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Growth Metrics</h3>
        <TrendingUp className="w-6 h-6 text-blue-600" />
      </div>

      <div className={`flex-1 ${isCompact ? 'flex items-center justify-around' : 'space-y-4'}`}>
        <div className={`flex items-center ${isCompact ? 'flex-col text-center' : 'space-x-2'}`}>
          <Users className={`text-blue-600 ${isCompact ? 'w-4 h-4 mb-1' : 'w-4 h-4'}`} />
          <div>
            <p className={`text-gray-600 dark:text-gray-400 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              New (30 days)
            </p>
            <p
              className={`font-semibold text-gray-900 dark:text-white ${isCompact ? 'text-sm' : 'text-lg'}`}
            >
              {data.last_30_days}
            </p>
          </div>
        </div>

        <div className={`flex items-center ${isCompact ? 'flex-col text-center' : 'space-x-2'}`}>
          <Target className={`text-green-600 ${isCompact ? 'w-4 h-4 mb-1' : 'w-4 h-4'}`} />
          <div>
            <p className={`text-gray-600 dark:text-gray-400 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              Conversion
            </p>
            <p
              className={`font-semibold text-gray-900 dark:text-white ${isCompact ? 'text-sm' : 'text-lg'}`}
            >
              {data.conversion_rate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
