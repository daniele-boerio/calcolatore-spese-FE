import React, { useMemo } from "react";
import { Chart } from "primereact/chart";

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

  // Leggiamo i colori dinamicamente dalle variabili CSS del root
  const { textColor, gridColor } = useMemo(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      textColor: computedStyle.getPropertyValue("--text-main").trim() || "#333",
      // Usa una tua variabile per i bordi, oppure un fallback semitrasparente che si adatti
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
