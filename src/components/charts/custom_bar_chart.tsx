import React, { useMemo } from "react";
import { Chart } from "primereact/chart";
import { useResolvedThemeColor } from "./use_theme_color";

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

  // Colori dalle CSS variable, risolti in modo reattivo al tema (vedi hook):
  // evita label scure illeggibili in dark mode su mobile.
  const textColor = useResolvedThemeColor("var(--text-main)");
  const gridColor = useResolvedThemeColor("var(--border-color)");

  // Avvolgiamo le opzioni in useMemo per ottimizzare le performance di React
  const chartOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          position: "bottom" as const, // <-- as const per evitare errori TypeScript
          labels: {
            usePointStyle: true,
            color: textColor,
          },
        },
        title: {
          display: !!title,
          text: title,
          color: textColor, // <-- Colore del titolo dinamico
          font: { size: 16 },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColor, // <-- Colore etichette asse X
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor, // <-- Colore etichette asse Y
          },
          grid: {
            color: gridColor, // <-- Colore griglia dinamico
          },
        },
      },
    }),
    [title, textColor, gridColor],
  );

  return (
    <div
      className="custom-chart-container"
      style={{ height: "350px", width: "100%" }}
    >
      <Chart
        type="bar"
        data={chartData}
        options={chartOptions}
        style={{ height: "100%" }}
      />
    </div>
  );
}
