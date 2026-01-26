import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import "./CustomPieChart.scss";

// 1. Definiamo l'interfaccia per il singolo elemento del grafico
interface PieDataItem {
  id: string | number;
  value: number;
  label?: string;
  color?: string;
}

// 2. Definiamo le Props del componente
interface CustomPieChartProps {
  data: PieDataItem[];
  height?: number;
}

const CustomPieChart: React.FC<CustomPieChartProps> = ({
  data,
  height = 300,
}) => {
  // Calcoliamo il totale reale
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  // Se non ci sono dati o il totale è 0, creiamo un set di dati "placeholder"
  // Tipizziamo esplicitamente chartData come array di PieDataItem
  const chartData: PieDataItem[] =
    data.length > 0 && total > 0
      ? data
      : [{ id: "empty", value: 1, color: "#e0e0e0", label: "Nessuna spesa" }];

  return (
    <div className="pie-chart-wrapper">
      <PieChart
        series={[
          {
            data: chartData,
            innerRadius: 75,
            outerRadius: 100,
            paddingAngle: data.length > 0 && total > 0 ? 5 : 0,
            cornerRadius: 4,
            cx: "50%",
            cy: "50%",
          },
        ]}
        slotProps={{
          legend: {
            direction: "row" as any,
            position: { vertical: "bottom", horizontal: "center" },
          },
        }}
        hideLegend={total === 0}
        height={height}
      />

      <div className="pie-chart-overlay">
        <span className="total-title">Totale</span>
        <span className="total-amount">€{total.toLocaleString("it-IT")}</span>
      </div>
    </div>
  );
};

export default CustomPieChart;
