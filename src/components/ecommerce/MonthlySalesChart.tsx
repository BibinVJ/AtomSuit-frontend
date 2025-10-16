"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Dynamically import Chart with no SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface MonthlySalesChartProps {
  data: {
    date: string;
    total: number;
  }[];
}

export default function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: '100%',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };
  const monthlySales = Array(12).fill(0);

  if (data) {
    data.forEach((d: { date: string; total: number }) => {
      const month = new Date(d.date).getMonth();
      monthlySales[month] += d.total;
    });
  }

  const series = [
    {
      name: "Sales",
      data: monthlySales,
    },
  ];

  // Don't render the chart during SSR
  if (!isClient) {
    return (
      <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-gray-200 custom-card-bg p-5 dark:border-gray-800">
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Monthly Sales
          </h3>
        </div>
        <div className="flex-grow w-full h-full flex items-center justify-center">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-gray-200 custom-card-bg p-5 dark:border-gray-800">
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Sales
        </h3>
      </div>

      <div className="flex-grow w-full h-full">
        <Chart options={options} series={series} type="bar" width="100%" height="100%" />
      </div>
    </div>
  );
}
