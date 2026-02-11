import React, { useEffect, useState } from "react";
import "./home_page.scss";
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
import { useI18n } from "../../i18n/use-i18n";
import CustomDoughnutChart from "../../components/charts/custom_doughnut_chart";
import TransactionDialog from "../../components/dialog/transaction_dialog/transaction_dialog";
import {
  selectContiConti,
  selectContiMonthlyExpensesByCategory,
} from "../../features/conti/conto_slice";

export default function HomePage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Selettori tipizzati dallo store
  const conti = useAppSelector(selectContiConti);
  const monthlyExpensesByCategory = useAppSelector(
    selectContiMonthlyExpensesByCategory,
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
        <BudgetCard />

        <div className="chart-section">
          <CustomDoughnutChart data={pieChartData} />
        </div>

        <CardCarousel conti={conti} direction="horizontal" />

        <TransactionList num={3} />

        <Button
          className="add-transaction-button"
          icon="pi pi-plus"
          compact
          rounded
          onClick={() => setIsCreateTransactionDialogVisible(true)}
        />
      </div>
      <TransactionDialog
        visible={isCreateTransactionDialogVisible}
        onHide={() => setIsCreateTransactionDialogVisible(false)}
      />
    </div>
  );
}
