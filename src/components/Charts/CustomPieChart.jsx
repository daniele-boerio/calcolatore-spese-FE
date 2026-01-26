import { PieChart } from "@mui/x-charts/PieChart";
import "./CustomPieChart.scss";

const CustomPieChart = ({ data, height = 300 }) => {
  // Calcoliamo il totale reale
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  // Se non ci sono dati o il totale è 0, creiamo un set di dati "placeholder"
  const chartData =
    data.length > 0 && total > 0
      ? data
      : [{ id: "empty", value: 1, color: "#e0e0e0", label: "Nessuna spesa" }];

  return (
    <div className="pie-chart-wrapper">
      <PieChart
        series={[
          {
            data: chartData, // Usiamo i dati reali o il placeholder
            innerRadius: 75,
            outerRadius: 100,
            paddingAngle: data.length > 0 ? 5 : 0, // Togliamo gli spazi se è vuoto
            cornerRadius: 4,
            cx: "50%",
            cy: "50%",
          },
        ]}
        slotProps={{
          legend: {
            // Nascondiamo la legenda se il grafico è vuoto
            hidden: total === 0,
            direction: "row",
            position: { vertical: "bottom", horizontal: "middle" },
            padding: 0,
          },
        }}
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
