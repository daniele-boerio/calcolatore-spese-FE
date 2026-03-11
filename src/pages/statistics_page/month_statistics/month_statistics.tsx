import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getMonthlyDetailsStatistics } from "../../../features/statistics/api_calls";
import {
  selectMonthlyStatisticsData,
  selectStatisticsLoading,
} from "../../../features/statistics/statistics_slice";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { getCategorie } from "../../../features/categorie/api_calls";
import Dropdown from "../../../components/dropdown/dropdown";
import { useI18n } from "../../../i18n/use-i18n";
import "./month_statistics.scss";
import { MonthlyDetailCategory } from "../../../features/statistics/interfaces";
import CustomCard from "../../../components/custom_card/custom_card";

// Se hai un'interfaccia nel tuo slice, usala. Altrimenti la definisco qui per chiarezza.

export default function MonthStatistics() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Selettori Redux
  const data = useAppSelector(selectMonthlyStatisticsData);
  const loading = useAppSelector(selectStatisticsLoading);
  const categorie = useAppSelector(selectCategoriaCategorie);

  // Stati locali per i filtri
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | null>(
    null,
  );

  // Opzioni Anno
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear - 5; y <= currentYear; y++) {
      years.push({ label: y.toString(), value: y });
    }
    return years.reverse();
  }, [currentYear]);

  // Caricamento Categorie all'avvio
  useEffect(() => {
    dispatch(getCategorie());
  }, [dispatch]);

  // Fetch dati statistici
  useEffect(() => {
    dispatch(
      getMonthlyDetailsStatistics({
        month: selectedMonth,
        year: selectedYear,
        categoria_id: selectedCategoriaId,
      }),
    );
  }, [dispatch, selectedYear, selectedMonth, selectedCategoriaId]);

  const monthNames = [
    { value: 1, label: t("Jan") },
    { value: 2, label: t("Feb") },
    { value: 3, label: t("Mar") },
    { value: 4, label: t("Apr") },
    { value: 5, label: t("May") },
    { value: 6, label: t("Jun") },
    { value: 7, label: t("Jul") },
    { value: 8, label: t("Aug") },
    { value: 9, label: t("Sept") },
    { value: 10, label: t("Oct") },
    { value: 11, label: t("Nov") },
    { value: 12, label: t("Dec") },
  ];

  // Filtriamo i dati per colonna
  const incomes = data.filter((cat) => cat.tipo === "ENTRATA");
  const expenses = data.filter((cat) => cat.tipo === "USCITA");
  const others = data.filter((cat) => cat.tipo === "OTHER");

  // Funzione helper per renderizzare una singola categoria con le sue sottocategorie
  const renderCategoryBlock = (cat: MonthlyDetailCategory) => (
    <div key={cat.categoria} className="category-card">
      <div className="category-header">
        <span className="name">{cat.categoria}</span>
        <span
          className="amount"
          style={{
            color:
              cat.totale < 0
                ? "var(--red-500)"
                : cat.totale > 0
                  ? "var(--green-500)"
                  : "inherit",
          }}
        >
          {cat.totale > 0 ? "+" : ""}
          {cat.totale.toLocaleString("it-IT", { minimumFractionDigits: 2 })} €
        </span>
      </div>

      {cat.sottocategorie.length > 0 && (
        <div className="subcategories-list">
          {cat.sottocategorie.map((sub) => (
            <div key={sub.sottocategoria} className="subcategory-item">
              <span className="name">{sub.sottocategoria}</span>
              <span className="amount">
                {sub.totale.toLocaleString("it-IT", {
                  minimumFractionDigits: 2,
                })}{" "}
                €
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="monthly-statistics-page">
      <header className="page-header">
        <div className="filters-row">
          <Dropdown
            label={t("month")}
            value={selectedMonth}
            options={monthNames}
            optionLabel="label"
            optionValue="value"
            placeholder={t("month")}
            onChange={(e) => setSelectedMonth(e.value)}
          />
          <Dropdown
            label={t("year")}
            value={selectedYear}
            options={yearOptions}
            optionLabel="label"
            optionValue="value"
            placeholder={t("year")}
            onChange={(e) => setSelectedYear(e.value)}
          />
          <Dropdown
            label={t("category")}
            value={selectedCategoriaId}
            options={categorie}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => setSelectedCategoriaId(e.value)}
            placeholder={t("categories")}
            showClear
          />
        </div>
      </header>

      {/* Se sta caricando, potresti mostrare uno spinner qui. Per ora mostriamo i dati. */}
      <div className="statistics-container">
        {/* COLONNA ENTRATE */}
        <div className="incomes">
          <h3>{t("income")}</h3>
          <div className="categories-wrapper">
            {incomes.length > 0 ? (
              incomes.map((cat) => (
                <CustomCard
                  key={cat.categoria}
                  title={cat.categoria}
                  totale={cat.totale}
                  sottocategorie={cat.sottocategorie}
                />
              ))
            ) : (
              <p className="no-data">{t("no_data")}</p>
            )}
          </div>
        </div>

        {/* COLONNA USCITE */}
        <div className="expenses">
          <h3>{t("expenses")}</h3>
          <div className="categories-wrapper">
            {expenses.length > 0 ? (
              expenses.map((cat) => (
                <CustomCard
                  key={cat.categoria}
                  title={cat.categoria}
                  totale={cat.totale}
                  sottocategorie={cat.sottocategorie}
                />
              ))
            ) : (
              <p className="no-data">{t("no_data")}</p>
            )}
          </div>
        </div>

        {/* COLONNA MISTE (OTHER) */}
        <div className="others">
          <h3>{t("others")}</h3>
          <div className="categories-wrapper">
            {others.length > 0 ? (
              others.map((cat) => (
                <CustomCard
                  key={cat.categoria}
                  title={cat.categoria}
                  totale={cat.totale}
                  sottocategorie={cat.sottocategorie}
                />
              ))
            ) : (
              <p className="no-data">{t("no_data")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
