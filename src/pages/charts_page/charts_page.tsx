import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useI18n } from "../../i18n/use-i18n";
import {
  getIncomeExpenseChart,
  getSavingsChart,
  getExpenseCompositionChart,
  getCategoryTrendChart,
} from "../../features/charts/api_calls";
import { getCategorie } from "../../features/categorie/api_calls";
import { selectCategoriaCategorie } from "../../features/categorie/categoria_slice";
import Dropdown from "../../components/dropdown/dropdown";
import Calendar from "../../components/calendar/calendar";
import CustomBarChart from "../../components/charts/custom_bar_chart";
import CustomLineChart from "../../components/charts/custom_line_chart";
import CustomDoughnutChart from "../../components/charts/custom_doughnut_chart";
import "./charts_page.scss";

export default function ChartsPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Redux State
  const { incomeExpense, savings, expenseComposition, categoryTrend } =
    useAppSelector((state) => state.charts);
  const categories = useAppSelector(selectCategoriaCategorie);

  // Helper for dates
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const today = new Date();

  const toDateStr = (date: Date | null) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Local Filters State
  const [incomeExpenseDates, setIncomeExpenseDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: startOfYear, end: today });

  const [savingsDates, setSavingsDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: startOfYear, end: today });

  const [compositionDates, setCompositionDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: startOfYear, end: today });

  const [trendDates, setTrendDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: startOfYear, end: today });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const monthNamesShort = useMemo(
    () => [
      t("Jan"),
      t("Feb"),
      t("Mar"),
      t("Apr"),
      t("May"),
      t("Jun"),
      t("Jul"),
      t("Aug"),
      t("Sept"),
      t("Oct"),
      t("Nov"),
      t("Dec"),
    ],
    [t],
  );

  // Initial Fetch for Categories
  useEffect(() => {
    dispatch(getCategorie());
  }, [dispatch]);

  // Set default category for the Trend Chart once categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // --- Fetch Charts Data ---
  useEffect(() => {
    dispatch(
      getIncomeExpenseChart({
        data_inizio: toDateStr(incomeExpenseDates.start),
        data_fine: toDateStr(incomeExpenseDates.end),
      }),
    );
  }, [dispatch, incomeExpenseDates]);

  useEffect(() => {
    dispatch(
      getSavingsChart({
        data_inizio: toDateStr(savingsDates.start),
        data_fine: toDateStr(savingsDates.end),
      }),
    );
  }, [dispatch, savingsDates]);

  useEffect(() => {
    dispatch(
      getExpenseCompositionChart({
        data_inizio: toDateStr(compositionDates.start),
        data_fine: toDateStr(compositionDates.end),
      }),
    );
  }, [dispatch, compositionDates]);

  useEffect(() => {
    if (selectedCategoryId) {
      dispatch(
        getCategoryTrendChart({
          categoria_id: selectedCategoryId,
          data_inizio: toDateStr(trendDates.start),
          data_fine: toDateStr(trendDates.end),
        }),
      );
    }
  }, [dispatch, trendDates, selectedCategoryId]);

  // --- Chart Data Preparation ---
  const formatLabel = (label: string) => {
    if (!label.includes("-")) {
      const monthIndex = parseInt(label, 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        return monthNamesShort[monthIndex];
      }
    }
    return label;
  };

  const incomeExpenseData = useMemo(() => {
    const labels = incomeExpense.map((item) => formatLabel(item.label));
    const entrate = incomeExpense.map((item) => item.entrate);
    const uscite = incomeExpense.map((item) => Math.abs(item.uscite));

    return {
      labels,
      datasets: [
        { label: t("income"), data: entrate, backgroundColor: "#4caf50" },
        { label: t("expenses"), data: uscite, backgroundColor: "#f44336" },
      ],
    };
  }, [incomeExpense, monthNamesShort, t]);

  const savingsData = useMemo(() => {
    const labels = savings.map((item) => formatLabel(item.label));
    const values = savings.map((item) => item.risparmio);

    return {
      labels,
      datasets: [
        {
          label: t("savings"),
          data: values,
          borderColor: "#2196f3",
          tension: 0.4,
          fill: true,
          backgroundColor: "rgba(33, 150, 243, 0.1)",
        },
      ],
    };
  }, [savings, monthNamesShort, t]);

  const compositionData = useMemo(() => {
    return expenseComposition.map((item) => ({
      label: item.categoria,
      value: Math.abs(item.totale),
    }));
  }, [expenseComposition]);

  const categoryTrendData = useMemo(() => {
    const labels = categoryTrend.map((item) => formatLabel(item.label));
    const values = categoryTrend.map((item) => Math.abs(item.spesa));
    const catName =
      categories.find((c) => c.id === selectedCategoryId)?.nome || "";

    return {
      labels,
      datasets: [
        {
          label: catName,
          data: values,
          borderColor: "#ff9800",
          tension: 0.4,
          pointRadius: 5,
          pointStyle: "circle",
        },
      ],
    };
  }, [categoryTrend, categories, selectedCategoryId, monthNamesShort]);

  return (
    <div className="charts-page">
      <header className="charts-header">
        <h1>{t("financial_charts")}</h1>
      </header>

      <div className="charts-grid">
        {/* CARD 1: ENTRATE VS USCITE */}
        <div className="chart-card">
          <div className="card-header">
            <h2>{t("income_vs_expenses")}</h2>
            <div className="card-filters">
              <Calendar
                value={incomeExpenseDates.start}
                onChange={(e) =>
                  setIncomeExpenseDates({
                    ...incomeExpenseDates,
                    start: e.value as Date,
                  })
                }
                dateFormat="dd/mm/yy"
                inputClassName="compact-calendar"
              />
              <span className="date-separator">-</span>
              <Calendar
                value={incomeExpenseDates.end}
                onChange={(e) =>
                  setIncomeExpenseDates({
                    ...incomeExpenseDates,
                    end: e.value as Date,
                  })
                }
                dateFormat="dd/mm/yy"
                inputClassName="compact-calendar"
              />
            </div>
          </div>
          <div className="chart-content">
            <CustomBarChart
              labels={incomeExpenseData.labels}
              datasets={incomeExpenseData.datasets}
            />
          </div>
        </div>

        {/* CARD 2: RISPARMI MENSILI */}
        <div className="chart-card">
          <div className="card-header">
            <h2>{t("monthly_savings")}</h2>
            <div className="card-filters">
              <Calendar
                value={savingsDates.start}
                onChange={(e) =>
                  setSavingsDates({ ...savingsDates, start: e.value as Date })
                }
                dateFormat="dd/mm/yy"
                inputClassName="compact-calendar"
              />
              <span className="date-separator">-</span>
              <Calendar
                value={savingsDates.end}
                onChange={(e) =>
                  setSavingsDates({ ...savingsDates, end: e.value as Date })
                }
                dateFormat="dd/mm/yy"
                inputClassName="compact-calendar"
              />
            </div>
          </div>
          <div className="chart-content">
            <CustomLineChart
              labels={savingsData.labels}
              datasets={savingsData.datasets}
            />
          </div>
        </div>

        {/* CARD 3: COMPOSIZIONE SPESE */}
        <div className="chart-card">
          <div className="card-header">
            <h2>{t("expense_composition")}</h2>
            <div className="card-filters">
              <Calendar
                value={compositionDates.start}
                onChange={(e) =>
                  setCompositionDates({
                    ...compositionDates,
                    start: e.value as Date,
                  })
                }
                dateFormat="dd/mm/yy"
                inputClassName="compact-calendar"
              />
              <span className="date-separator">-</span>
              <Calendar
                value={compositionDates.end}
                onChange={(e) =>
                  setCompositionDates({
                    ...compositionDates,
                    end: e.value as Date,
                  })
                }
                dateFormat="dd/mm/yy"
                inputClassName="compact-calendar"
              />
            </div>
          </div>
          <div className="chart-content">
            <CustomDoughnutChart data={compositionData} />
          </div>
        </div>

        {/* CARD 4: TREND CATEGORIA */}
        <div className="chart-card">
          <div className="card-header column">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <h2>{t("category_trend")}</h2>
              <Dropdown
                value={selectedCategoryId}
                options={categories}
                optionLabel="nome"
                optionValue="id"
                onChange={(e) => setSelectedCategoryId(e.value)}
                placeholder={t("select_category")}
                className="compact-dropdown"
              />
            </div>
            <div className="card-filters" style={{ marginTop: "0.5rem" }}>
              <Calendar
                value={trendDates.start}
                onChange={(e) =>
                  setTrendDates({ ...trendDates, start: e.value as Date })
                }
                dateFormat="dd/mm/yy"
                inputClassName="compact-calendar"
              />
              <span className="date-separator">-</span>
              <Calendar
                value={trendDates.end}
                onChange={(e) =>
                  setTrendDates({ ...trendDates, end: e.value as Date })
                }
                dateFormat="dd/mm/yy"
                inputClassName="compact-calendar"
              />
            </div>
          </div>
          <div className="chart-content">
            <CustomLineChart
              labels={categoryTrendData.labels}
              datasets={categoryTrendData.datasets}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
