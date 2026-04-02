import React, { useMemo } from "react";
import { Chart } from "primereact/chart";
import { useI18n } from "../../i18n/use-i18n";

interface BarChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderRadius?: number;
  }[];
  title?: string;
}

export default function CustomBarChart({
  labels,
  datasets,
  title,
}: BarChartProps) {
  const chartData = {
    labels,
    datasets,
  };

  const chartOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
        },
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16 },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
      },
    },
  };

  return (
    <div className="custom-chart-container" style={{ height: "350px" }}>
      <Chart
        type="bar"
        data={chartData}
        options={chartOptions}
        style={{ height: "100%" }}
      />
    </div>
  );
}
