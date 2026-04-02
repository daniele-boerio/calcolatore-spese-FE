import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getMonthlyDetailsStatistics } from "../../../features/statistics/api_calls";
import {
  selectMonthlyStatisticsData,
  selectMonthlyTotals,
  selectStatisticsLoading,
} from "../../../features/statistics/statistics_slice";
import {
  selectCategoriaCategorie,
  selectCategoriaSottocategorie,
} from "../../../features/categorie/categoria_slice";
import { getCategorie } from "../../../features/categorie/api_calls";
import { selectTagTags } from "../../../features/tags/tag_slice"; // <-- Aggiunto
import { getTags } from "../../../features/tags/api_calls"; // <-- Aggiunto
import Dropdown from "../../../components/dropdown/dropdown";
import { useI18n } from "../../../i18n/use-i18n";
import "./month_statistics.scss";
import { MonthlyDetailCategory } from "../../../features/statistics/interfaces";
import CustomCard from "../../../components/custom_card/custom_card";
import TransactionsListDialog from "../../../components/dialog/transactions_list_dialog/transactions_list_dialog";

export default function MonthStatistics() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Selettori Redux
  const data = useAppSelector(selectMonthlyStatisticsData);
  const totals = useAppSelector(selectMonthlyTotals);
  const loading = useAppSelector(selectStatisticsLoading);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const sottocategorie = useAppSelector(selectCategoriaSottocategorie);
  const tags = useAppSelector(selectTagTags); // <-- Aggiunto

  // Stati locali per i filtri
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | null>(
    null,
  );
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null); // <-- Aggiunto

  // Dialog State
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogFilters, setDialogFilters] = useState<{
    categoria_id?: string;
    sottocategoria_id?: string;
    tag_id?: string; // <-- Aggiunto
    data_inizio?: string;
    data_fine?: string;
  }>({});

  // Helpers
  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleCategoryClick = (categoryName: string) => {
    const catId = categorie.find((c) => c.nome === categoryName)?.id;
    if (!catId) return;

    const start = new Date(selectedYear, selectedMonth - 1, 1);
    const end = new Date(selectedYear, selectedMonth, 0);

    setDialogFilters({
      categoria_id: catId,
      tag_id: selectedTagId || undefined, // <-- Passiamo il tag se selezionato
      data_inizio: toDateStr(start),
      data_fine: toDateStr(end),
    });
    setDialogTitle(`${t("nav_transactions")} - ${categoryName}`);
    setIsDialogVisible(true);
  };

  const handleSubcategoryClick = (
    subcategoryName: string,
    categoryName: string,
  ) => {
    const cat = categorie.find((c) => c.nome === categoryName);
    if (!cat) return;
    const subCat = cat.sottocategorie?.find((s) => s.nome === subcategoryName);

    const start = new Date(selectedYear, selectedMonth - 1, 1);
    const end = new Date(selectedYear, selectedMonth, 0);

    setDialogFilters({
      categoria_id: cat.id,
      sottocategoria_id: subCat?.id,
      tag_id: selectedTagId || undefined, // <-- Passiamo il tag se selezionato
      data_inizio: toDateStr(start),
      data_fine: toDateStr(end),
    });
    setDialogTitle(`${t("nav_transactions")} - ${subcategoryName}`);
    setIsDialogVisible(true);
  };

  // Opzioni Anno
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear - 5; y <= currentYear; y++) {
      years.push({ label: y.toString(), value: y });
    }
    return years.reverse();
  }, [currentYear]);

  // Caricamento Dati all'avvio
  useEffect(() => {
    dispatch(getCategorie());
    dispatch(getTags()); // <-- Carichiamo i tag
  }, [dispatch]);

  // Fetch dati statistici
  useEffect(() => {
    dispatch(
      getMonthlyDetailsStatistics({
        month: selectedMonth,
        year: selectedYear,
        categoria_id: selectedCategoriaId,
        tag_id: selectedTagId, // <-- Passiamo il tag all'API
      }),
    );
  }, [
    dispatch,
    selectedYear,
    selectedMonth,
    selectedCategoriaId,
    selectedTagId,
  ]);

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

  // Calcolo totali
  const totalIncomes = totals.incomes;
  const totalExpenses = totals.expenses;

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
          {/* NUOVO DROPDOWN PER I TAG */}
          <Dropdown
            label={t("tag")}
            value={selectedTagId}
            options={tags}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => setSelectedTagId(e.value)}
            placeholder={t("tag") || "Tag"}
            showClear
          />
        </div>
      </header>

      <div className="summary-stats-row">
        <div className="stats">
          <h3 className="stats-item income">
            {t("income")}:{" "}
            <span>
              {totalIncomes.toLocaleString("it-IT", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </span>
          </h3>
          <h3 className="stats-item expenses">
            {t("expenses")}:{" "}
            <span>
              {totalExpenses.toLocaleString("it-IT", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </span>
          </h3>
        </div>
      </div>

      {loading && <p className="no-data">{t("loading_data")}</p>}

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
                  onClick={handleCategoryClick}
                  onSubcategoryClick={handleSubcategoryClick}
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
                  onClick={handleCategoryClick}
                  onSubcategoryClick={handleSubcategoryClick}
                />
              ))
            ) : (
              <p className="no-data">{t("no_data")}</p>
            )}
          </div>
        </div>
      </div>

      <TransactionsListDialog
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        title={dialogTitle}
        filters={dialogFilters}
      />
    </div>
  );
}
