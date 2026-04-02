import React, { useMemo } from "react"; // <-- Aggiunto useMemo
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

  // Leggiamo i colori dinamicamente dalle variabili CSS del root (Come nel Bar Chart!)
  const { textColor, gridColor } = useMemo(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      textColor: computedStyle.getPropertyValue("--text-main").trim() || "#333",
      gridColor:
        computedStyle.getPropertyValue("--border-color").trim() ||
        "rgba(128, 128, 128, 0.2)",
    };
  }, []);

  // Avvolgiamo le opzioni in useMemo per ottimizzare le performance di React
  const chartOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            usePointStyle: true,
            color: textColor, // <-- Colore testuale dinamico
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
            color: gridColor, // <-- Linee della griglia adattate al tema
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
        type="line"
        data={chartData}
        options={chartOptions}
        style={{ height: "100%" }}
      />
    </div>
  );
}
