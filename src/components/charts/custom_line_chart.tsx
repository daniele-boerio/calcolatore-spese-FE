import React from "react";
import { Chart } from "primereact/chart";

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
    pointStyle?: string;
    pointRadius?: number;
  }[];
  title?: string;
}

export default function CustomLineChart({
  labels,
  datasets,
  title,
}: LineChartProps) {
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
        type="line"
        data={chartData}
        options={chartOptions}
        style={{ height: "100%" }}
      />
    </div>
  );
}
