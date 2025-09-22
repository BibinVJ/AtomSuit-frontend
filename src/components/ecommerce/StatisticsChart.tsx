"use client";

import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import { useState, useEffect } from "react";

type Period = "monthly" | "quarterly" | "annually";

interface StatisticsChartProps {
  data: {
    sales: { date: string; total: number }[];
    purchases: { date: string; total: number }[];
  };
}

export default function StatisticsChart({ data }: StatisticsChartProps) {
  const [period, setPeriod] = useState<Period>("monthly");
  const [chartSeries, setChartSeries] = useState<{ name: string; data: number[] }[]>([]);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({});

  useEffect(() => {
    const processChartData = () => {
      const sales = data?.sales || [];
      const purchases = data?.purchases || [];

      let categories: string[] = [];
      let salesData: number[] = [];
      let purchasesData: number[] = [];

      if (period === 'annually') {
        const allDates = [...new Set([...sales.map((s) => s.date), ...purchases.map((p) => p.date)])].sort();
        const salesMap = new Map(sales.map((s) => [s.date, s.total]));
        const purchasesMap = new Map(purchases.map((p) => [p.date, p.total]));
        
        categories = allDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        salesData = allDates.map(date => salesMap.get(date) || 0);
        purchasesData = allDates.map(date => purchasesMap.get(date) || 0);

      } else if (period === 'monthly') {
        categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlySales: number[] = new Array(12).fill(0);
        const monthlyPurchases: number[] = new Array(12).fill(0);

        sales.forEach((s) => {
          const month = new Date(s.date).getMonth();
          monthlySales[month] += s.total;
        });
        purchases.forEach((p) => {
          const month = new Date(p.date).getMonth();
          monthlyPurchases[month] += p.total;
        });
        salesData = monthlySales;
        purchasesData = monthlyPurchases;

      } else if (period === 'quarterly') {
        categories = ["Q1", "Q2", "Q3", "Q4"];
        const quarterlySales: number[] = new Array(4).fill(0);
        const quarterlyPurchases: number[] = new Array(4).fill(0);

        const getQuarter = (date: Date) => Math.floor(date.getMonth() / 3);

        sales.forEach((s) => {
          const quarter = getQuarter(new Date(s.date));
          quarterlySales[quarter] += s.total;
        });
        purchases.forEach((p) => {
          const quarter = getQuarter(new Date(p.date));
          quarterlyPurchases[quarter] += p.total;
        });
        salesData = quarterlySales;
        purchasesData = quarterlyPurchases;
      }

      setChartSeries([
        { name: "Sales", data: salesData },
        { name: "Purchases", data: purchasesData },
      ]);

      setChartOptions({
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "left",
          fontFamily: "Outfit, sans-serif",
        },
        colors: ["#465FFF", "#9CB9FF"],
        chart: {
          fontFamily: "Outfit, sans-serif",
          height: '100%',
          type: "area",
          toolbar: { show: false },
        },
        stroke: { curve: "smooth", width: [2, 2] },
        fill: {
          type: "gradient",
          gradient: { opacityFrom: 0.55, opacityTo: 0 },
        },
        markers: {
          size: 0,
          strokeColors: "#fff",
          strokeWidth: 2,
          hover: { size: 6 },
        },
        grid: {
          xaxis: { lines: { show: false } },
          yaxis: { lines: { show: true } },
        },
        dataLabels: { enabled: false },
        tooltip: { enabled: true, x: { format: "dd MMM yyyy" } },
        xaxis: {
          type: "category",
          categories: categories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          tooltip: { enabled: false },
        },
        yaxis: {
          labels: { style: { fontSize: "12px", colors: ["#6B7280"] } },
        },
      });
    };

    processChartData();
  }, [data, period]);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 custom-card-bg p-5 dark:border-gray-800">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between flex-shrink-0">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Sale and purchase comparison chart
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab selectedPeriod={period} onSelectPeriod={setPeriod} />
        </div>
      </div>

      <div className="flex-grow w-full h-full">
        <Chart options={chartOptions} series={chartSeries} type="area" width="100%" height="100%" />
      </div>
    </div>
  );
}
