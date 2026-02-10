import React, { useMemo } from "react";
import { Chart } from "primereact/chart";
import "./custom_doughnut_chart.scss";
import { useI18n } from "../../i18n/use-i18n";

interface DoughnutDataItem {
  id: string | number;
  value: number;
  label?: string;
  color?: string;
}

interface CustomDoughnutChartProps {
  data: DoughnutDataItem[];
}

/**
 * Genera un colore basato sull'indice della fetta per garantire
 * che ogni categoria abbia un colore nettamente diverso dalle vicine.
 */
const getCategoryColor = (index: number, totalItems: number) => {
  // Dividiamo i 360 gradi della ruota dei colori per il numero di fette
  // Aggiungiamo un offset (es. 40) per non partire sempre dal rosso
  const hue = (index * (360 / totalItems) + 40) % 360;
  return `hsl(${hue}, 85%, 50%)`;
};

export default function CustomDoughnutChart({
  data,
}: CustomDoughnutChartProps) {
  const { t } = useI18n();
  const total = useMemo(
    () => data.reduce((acc, curr) => acc + curr.value, 0),
    [data],
  );

  const chartData = useMemo(() => {
    if (data.length > 0 && total > 0) {
      // Mappiamo i dati assegnando un colore unico basato sulla posizione
      const backgroundColors = data.map(
        (item, index) => item.color || getCategoryColor(index, data.length),
      );

      return {
        labels: data.map((item) => item.label || item.id.toString()),
        datasets: [
          {
            data: data.map((item) => item.value),
            backgroundColor: backgroundColors,
            hoverBackgroundColor: backgroundColors.map(
              (c) => c.replace("60%", "50%"), // Effetto hover leggermente più scuro
            ),
            borderWidth: 2,
            borderColor: "transparent",
          },
        ],
      };
    }

    return {
      labels: ["No data"],
      datasets: [
        {
          data: [1],
          backgroundColor: ["#e0e0e0"],
          borderWidth: 0,
        },
      ],
    };
  }, [data, total]);

  const chartOptions = {
    cutout: "75%",
    plugins: {
      legend: {
        display: total > 0,
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: { enabled: total > 0 },
    },
    maintainAspectRatio: false,
    spacing: data.length > 1 && total > 0 ? 5 : 0,
  };

  return (
    <div className="doughnut-chart-wrapper">
      <Chart
        type="doughnut"
        data={chartData}
        options={chartOptions}
        className="custom-chart-object"
      />

      <div className="doughnut-chart-overlay">
        <span className="total-title">{t("total")}</span>
        <span className="total-amount">
          €{total.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
