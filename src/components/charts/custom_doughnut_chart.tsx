import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutDataItem {
  label: string;
  value: number;
}

interface DoughnutChartProps {
  data: DoughnutDataItem[];
  showTotalText?: boolean; // <-- Nuova prop per nascondere il testo se serve
  fontSize?: number;
  textColor?: string;
  aspectRatio?: number;
}

/**
 * Plugin per disegnare testo personalizzato al centro del doughnut
 * Ora gestisce testi su più righe (separati da \n)
 */
const createDoughnutLabelPlugin = (
  text: string,
  fontSize: number,
  textColor: string,
): Plugin => ({
  id: "doughnutLabel",
  afterDatasetsDraw(chart: any) {
    const { ctx } = chart;

    if (!text) return;

    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data || meta.data.length === 0) {
      return;
    }

    const centerX = meta.data[0].x;
    const centerY = meta.data[0].y;

    ctx.save();
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Dividiamo il testo se c'è un "a capo" (\n)
    const lines = text.split("\n");

    if (lines.length > 1) {
      // PRIMA RIGA ("Totale:"): Font normale e più piccolo
      ctx.font = `normal ${fontSize * 0.6}px sans-serif`;
      ctx.fillText(lines[0], centerX, centerY - fontSize * 0.5);

      // SECONDA RIGA (Numero): Font grassetto e grande
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(lines[1], centerX, centerY + fontSize * 0.6);
    } else {
      // Fallback per testo su riga singola
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(text, centerX, centerY);
    }

    ctx.restore();
  },
});

export default function CustomDoughnutChart({
  data,
  showTotalText = true, // Di default mostra sempre il totale
  fontSize = 25,
  textColor = "var(--text-main)",
  aspectRatio = 0.5,
}: DoughnutChartProps) {
  const resolvedTextColor = useMemo(() => {
    if (textColor.includes("var(")) {
      const computedStyle = getComputedStyle(document.documentElement);
      const cssVarName = textColor.match(/var\((.*?)\)/)?.[1];
      if (cssVarName) {
        return computedStyle.getPropertyValue(cssVarName).trim();
      }
    }
    return textColor;
  }, [textColor]);

  // CALCOLO AUTOMATICO DEL TOTALE INTERNO
  const totalText = useMemo(() => {
    if (!showTotalText || data.length === 0) return "";

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const formattedNum = total.toLocaleString("it-IT", {
      minimumFractionDigits: 2,
    });

    // Passiamo il testo con \n per mandarlo a capo nel Canvas
    return `Totale:\n€ ${formattedNum}`;
  }, [data, showTotalText]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: ["Nessun dato"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e0e0e0"],
            borderWidth: 0,
            cutout: "75%",
          },
        ],
      };
    }

    return {
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: data.map((_, index) => {
            const hue = (index * (360 / data.length)) % 360;
            return `hsl(${hue}, 75%, 60%)`;
          }),
          borderColor: "var(--bg-card)",
          borderWidth: 2,
          cutout: "75%",
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"doughnut"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio,
      plugins: {
        legend: {
          display: data.length > 0,
          position: "bottom" as const,
          labels: {
            color: resolvedTextColor,
            font: { size: 13 },
            padding: 15,
            usePointStyle: true,
            generateLabels: (chart: any) => {
              const chartData = chart.data;
              if (chartData.labels.length && chartData.datasets.length) {
                return chartData.labels.map((label: string, i: number) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);

                  return {
                    text: label,
                    fillStyle: style.backgroundColor,
                    strokeStyle: "transparent",
                    lineWidth: 0,
                    pointStyle: "circle",
                    hidden: !chart.getDataVisibility(i),
                    index: i,
                    fontColor: resolvedTextColor,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          enabled: data.length > 0,
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed;
              const dataset = context.dataset.data;
              const total = (dataset as number[]).reduce((a, b) => a + b, 0);
              if (total === 0) return label;
              const percentage = ((value / total) * 100).toFixed(1);

              return ` ${label}: ${value.toLocaleString("it-IT")} (${percentage}%)`;
            },
          },
        },
      },
    }),
    [aspectRatio, data.length, resolvedTextColor],
  );

  const plugins = useMemo(() => {
    if (data.length === 0 || !totalText) return [];
    return [createDoughnutLabelPlugin(totalText, fontSize, resolvedTextColor)];
  }, [totalText, fontSize, resolvedTextColor, data.length]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Doughnut
        key={`doughnut-${data.length}`}
        data={chartData}
        options={options}
        plugins={plugins}
      />
    </div>
  );
}
