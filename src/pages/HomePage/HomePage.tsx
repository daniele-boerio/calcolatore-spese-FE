import React, { useEffect } from "react";
import "./HomePage.scss";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import BudgetCard from "../../components/BudgetCard/BudgetCard";
import CardCarousel from "../../components/CardCarousel/CardCarousel";
import TransactionList from "../../components/TransactionList/TransactionList";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  getConti,
  getCurrentMonthExpenses,
  getCurrentMonthExpensesByCategory,
} from "../../features/conti/apiCalls";
import Button from "../../components/Button/Button";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Selettori tipizzati dallo store
  const conti = useAppSelector((state) => state.conto.conti);
  const monthlyExpensesByCategory = useAppSelector(
    (state) => state.conto.monthlyExpensesByCategory,
  );

  useEffect(() => {
    // Caricamento dati iniziale
    dispatch(getCurrentMonthExpenses());
    dispatch(getCurrentMonthExpensesByCategory());
    dispatch(getConti());
  }, [dispatch]);

  // Mappiamo i dati per il grafico a torta
  // Trasformiamo { categoria: string, totale: number } in { id, value, label }
  const pieChartData = monthlyExpensesByCategory.map((item, index) => ({
    id: index,
    value: item.totale,
    label: item.categoria,
  }));

  return (
    <div className="home-page-wrapper">
      <div className="body">
        {/* BudgetCard non richiede più la prop title se gestita internamente */}
        <BudgetCard />

        <div className="chart-section">
          <CustomPieChart data={pieChartData} />
        </div>

        <CardCarousel conti={conti} />

        <TransactionList num={3} />

        <Button
          className="add-transaction-button"
          icon="pi pi-plus"
          compact
          rounded
          onClick={() => console.log("Apri modal nuova transazione")}
        />
      </div>
    </div>
  );
};

export default HomePage;
