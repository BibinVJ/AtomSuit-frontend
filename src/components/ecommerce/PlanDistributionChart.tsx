"use client";

import { useState, useRef, useEffect } from "react";
import { PieChart } from "lucide-react";

interface PlanDistributionChartProps {
  data: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function PlanDistributionChart({ data }: PlanDistributionChartProps) {
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setHeight(entries[0].contentRect.height);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div ref={ref} className="rounded-2xl border border-gray-200 custom-card-bg p-4 md:p-5 flex flex-col h-full w-full dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plan Distribution</h3>
          <PieChart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex items-center justify-center flex-1 text-gray-500">
          No plan data available
        </div>
      </div>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const isCompact = height < 200;

  return (
    <div ref={ref} className="rounded-2xl border border-gray-200 custom-card-bg p-4 md:p-5 flex flex-col h-full w-full dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plan Distribution</h3>
        <PieChart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
      </div>
      
      <div className={`flex-1 ${isCompact ? 'space-y-2' : 'space-y-3'}`}>
        {chartData.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const color = COLORS[index % COLORS.length];
          
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className={`text-gray-700 dark:text-gray-300 ${isCompact ? 'text-xs' : 'text-sm'}`}>{item.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 ${isCompact ? 'w-16' : 'w-20'}`}>
                  <div 
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color 
                    }}
                  />
                </div>
                <div className="text-right min-w-[40px]">
                  <div className={`font-semibold text-gray-900 dark:text-white ${isCompact ? 'text-xs' : 'text-sm'}`}>{item.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {!isCompact && (
        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total</span>
            <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}