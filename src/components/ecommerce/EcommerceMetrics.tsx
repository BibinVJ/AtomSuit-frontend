import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
  DollarLineIcon,
  PageIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  percentage?: number;
  trend?: "up" | "down";
}

const MetricCard = ({ icon, title, value, percentage, trend }: MetricCardProps) => (
  <div className="rounded-2xl border border-gray-200 custom-card-bg p-5 dark:border-gray-800 md:p-6">
    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
      {icon}
    </div>
    <div className="flex items-end justify-between mt-5">
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
          {value}
        </h4>
      </div>
      {trend && percentage && (
        <Badge color={trend === "up" ? "success" : "error"}>
          {trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {percentage}%
        </Badge>
      )}
    </div>
  </div>
);

export default function EcommerceMetrics({ data }: { data: {
  total_sales_amount: number;
  total_purchase_amount: number;
  total_customers: number;
  total_items: number;
} }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      <MetricCard
        icon={<DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />}
        title="Total Sales"
        value={`${data?.total_sales_amount ?? 0}`}
      />
      <MetricCard
        icon={<BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />}
        title="Total Purchase"
        value={`${data?.total_purchase_amount ?? 0}`}
      />
      <MetricCard
        icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
        title="Total Customers"
        value={data?.total_customers ?? 0}
      />
      <MetricCard
        icon={<PageIcon className="text-gray-800 size-6 dark:text-white/90" />}
        title="Total Items"
        value={data?.total_items ?? 0}
      />
    </div>
  );
}
