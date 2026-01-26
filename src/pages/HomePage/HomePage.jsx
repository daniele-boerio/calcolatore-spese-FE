import "./HomePage.scss";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import BudgetCard from "../../components/BudgetCard/BudgetCard";
import CardCarousel from "../../components/CardCarousel/CardCarousel";
import TransactionList from "../../components/TransactionList/TransactionList";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  getConti,
  getCurrentMonthExpenses,
  getCurrentMonthExpensesByCategory,
} from "../../features/conti/apiCalls";
import { useAppSelector } from "../../store/store";
import Button from "../../components/Button/Button";
import Navbar from "../../components/Navbar/Navbar";

const HomePage = () => {
  const dispatch = useDispatch();
  const conti = useAppSelector((state) => state.conto.conti);
  const monthlyExpensesByCategory = useAppSelector(
    (state) => state.conto.monthlyExpensesByCategory,
  );

  useEffect(() => {
    async function fetchData() {
      dispatch(getCurrentMonthExpenses());
      dispatch(getCurrentMonthExpensesByCategory());
      dispatch(getConti());
    }

    fetchData();
  }, [dispatch]);

  return (
    <div className="home-page-wrapper">
      <div className="body">
        <BudgetCard title="Budget Mensile" />

        <CustomPieChart data={monthlyExpensesByCategory} />

        <CardCarousel conti={conti} />

        <TransactionList num={3} />

        <Button
          className="add-transaction-button"
          icon="pi pi-plus"
          compact
          rounded
        />
      </div>
    </div>
  );
};

export default HomePage;
