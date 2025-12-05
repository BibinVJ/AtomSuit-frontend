"use client";

import { useState, useRef, useEffect } from "react";
import { Users, UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react';

interface TenantOverviewProps {
  data: {
    total: number;
    active: number;
    suspended: number;
    on_trial: number;
    in_grace_period: number;
    expired: number;
    paid_subscribers: number;
    recent_registrations: number;
    archived: number;
  };
}

export default function TenantOverviewCard({ data }: TenantOverviewProps) {
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

  const stats = [
    { label: 'Active', value: data.active, icon: UserCheck, color: 'text-green-600' },
    { label: 'Suspended', value: data.suspended, icon: UserX, color: 'text-red-600' },
    { label: 'On Trial', value: data.on_trial, icon: Clock, color: 'text-blue-600' },
    { label: 'Expired', value: data.expired, icon: AlertTriangle, color: 'text-orange-600' },
  ];

  const isCompact = height < 180;

  return (
    <div ref={ref} className="rounded-2xl border border-gray-200 custom-card-bg p-4 md:p-5 flex flex-col h-full w-full dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tenant Overview</h3>
        <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
      </div>
      
      <div className={`flex-1 grid ${isCompact ? 'grid-cols-4 gap-2' : 'grid-cols-2 gap-4'}`}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`flex ${isCompact ? 'flex-col items-center text-center' : 'items-center space-x-2'}`}>
              <Icon className={`${isCompact ? 'w-3 h-3 mb-1' : 'w-4 h-4'} ${stat.color}`} />
              <div>
                <p className={`text-gray-600 dark:text-gray-400 ${isCompact ? 'text-xs' : 'text-sm'}`}>{stat.label}</p>
                <p className={`font-semibold text-gray-900 dark:text-white ${isCompact ? 'text-sm' : 'text-lg'}`}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {!isCompact && (
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Tenants</span>
            <span className="font-semibold text-gray-900 dark:text-white">{data.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}