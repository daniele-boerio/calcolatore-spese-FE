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
  /** Sovrappone una linea di tendenza (regressione lineare) al primo dataset */
  showTrendline?: boolean;
  /** Etichetta della linea di tendenza in legenda */
  trendlineLabel?: string;
}

/**
 * Regressione lineare ai minimi quadrati sui valori numerici della serie.
 * Restituisce i punti della retta (uno per ogni indice), oppure null se i
 * dati non sono sufficienti (servono almeno 2 punti validi).
 */
function computeTrendline(data: number[]): number[] | null {
  const points = data
    .map((y, x) => ({ x, y }))
    .filter((p) => typeof p.y === "number" && !isNaN(p.y));

  if (points.length < 2) return null;

  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return data.map((_, x) => slope * x + intercept);
}

export default function CustomLineChart({
  labels,
  datasets,
  title,
  showTrendline = false,
  trendlineLabel,
}: LineChartProps) {
  const chartData = useMemo(() => {
    if (!showTrendline || datasets.length === 0) {
      return { labels, datasets };
    }

    const trend = computeTrendline(datasets[0].data);
    if (!trend) return { labels, datasets };

    const trendDataset = {
      label: trendlineLabel || "Trend",
      data: trend,
      borderColor: datasets[0].borderColor,
      borderDash: [6, 6],
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
    };

    return { labels, datasets: [...datasets, trendDataset] };
  }, [labels, datasets, showTrendline, trendlineLabel]);

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
