import React, { useEffect, useState } from "react";
import "./home_page.scss";
import CustomPieChart from "../../components/charts/custom_pie_chart";
import BudgetCard from "../../components/budget_card/budget_card";
import CardCarousel from "../../components/card_carousel/card_carousel";
import TransactionList from "../../components/transaction_list/transaction_list";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  getConti,
  getCurrentMonthExpenses,
  getCurrentMonthExpensesByCategory,
} from "../../features/conti/api_calls";
import Button from "../../components/button/button";
import CreateTransactionDialog from "../../components/dialog/create_transazione_dialog/create_transazione_dialog";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Selettori tipizzati dallo store
  const conti = useAppSelector((state: any) => state.conto.conti);
  const monthlyExpensesByCategory = useAppSelector(
    (state: any) => state.conto.monthlyExpensesByCategory,
  );

  const [
    isCreateTransactionDialogVisible,
    setIsCreateTransactionDialogVisible,
  ] = useState<boolean>(false);

  useEffect(() => {
    // Caricamento dati iniziale
    dispatch(getCurrentMonthExpenses());
    dispatch(getCurrentMonthExpensesByCategory());
    dispatch(getConti());
  }, [dispatch]);

  // Mappiamo i dati per il grafico a torta
  // Trasformiamo { categoria: string, totale: number } in { id, value, label }
  const pieChartData = monthlyExpensesByCategory.map(
    (item: { value: number; label: string }, index: number) => ({
      id: index,
      value: item.value,
      label: item.label,
    }),
  );

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
          onClick={() => setIsCreateTransactionDialogVisible(true)}
        />
      </div>
      <CreateTransactionDialog
        visible={isCreateTransactionDialogVisible}
        onHide={() => setIsCreateTransactionDialogVisible(false)}
      />
    </div>
  );
};

export default HomePage;
