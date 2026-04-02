import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getYearDetailsStatistics } from "../../../features/statistics/api_calls";
import {
  selectYearlyStatisticsData,
  selectStatisticsLoading,
} from "../../../features/statistics/statistics_slice";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { getCategorie } from "../../../features/categorie/api_calls";
import Dropdown from "../../../components/dropdown/dropdown";
import { useI18n } from "../../../i18n/use-i18n";
import CustomCard from "../../../components/custom_card/custom_card"; // Assicurati che il percorso sia corretto
import TransactionsListDialog from "../../../components/dialog/transactions_list_dialog/transactions_list_dialog";
import "./year_statistics.scss";

export default function YearStatistics() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Selettori Redux
  const data = useAppSelector(selectYearlyStatisticsData);
  const loading = useAppSelector(selectStatisticsLoading);
  const categorie = useAppSelector(selectCategoriaCategorie);

  // Stati locali per i filtri
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | null>(
    null,
  );

  // Dialog State
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogFilters, setDialogFilters] = useState<{
    categoria_id?: string;
    sottocategoria_id?: string;
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
    // Se selectedCategoriaId è impostato, categoryName è in realtà il nome della sottocategoria
    if (selectedCategoriaId) {
      const selectedCat = categorie.find((c) => c.id === selectedCategoriaId);
      if (!selectedCat) return;

      const subCat = selectedCat.sottocategorie?.find(
        (s) => s.nome === categoryName,
      );
      if (!subCat) return;

      const start = new Date(selectedYear, 0, 1);
      const end = new Date(selectedYear, 11, 31);

      setDialogFilters({
        categoria_id: selectedCat.id,
        sottocategoria_id: subCat.id,
        data_inizio: toDateStr(start),
        data_fine: toDateStr(end),
      });
      setDialogTitle(`${t("nav_transactions")} - ${categoryName}`);
      setIsDialogVisible(true);
    } else {
      // Comportamento originale quando non è selezionata una categoria
      const catId = categorie.find((c) => c.nome === categoryName)?.id;
      if (!catId) return;

      const start = new Date(selectedYear, 0, 1);
      const end = new Date(selectedYear, 11, 31);

      setDialogFilters({
        categoria_id: catId,
        data_inizio: toDateStr(start),
        data_fine: toDateStr(end),
      });
      setDialogTitle(`${t("nav_transactions")} - ${categoryName}`);
      setIsDialogVisible(true);
    }
  };

  const handleSubcategoryClick = (monthName: string, categoryName: string) => {
    // Se selectedCategoriaId è impostato, categoryName è in realtà il nome della sottocategoria
    if (selectedCategoriaId) {
      const selectedCat = categorie.find((c) => c.id === selectedCategoriaId);
      if (!selectedCat) return;

      const subCat = selectedCat.sottocategorie?.find(
        (s) => s.nome === categoryName,
      );
      if (!subCat) return;

      const monthNamesLocal = [
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
      ];

      const monthIndex = monthNamesLocal.indexOf(monthName);
      if (monthIndex === -1) return;

      const start = new Date(selectedYear, monthIndex, 1);
      const end = new Date(selectedYear, monthIndex + 1, 0);

      setDialogFilters({
        categoria_id: selectedCat.id,
        sottocategoria_id: subCat.id,
        data_inizio: toDateStr(start),
        data_fine: toDateStr(end),
      });
      setDialogTitle(
        `${t("nav_transactions")} - ${categoryName} (${monthName})`,
      );
      setIsDialogVisible(true);
    } else {
      // Comportamento originale quando non è selezionata una categoria
      const catId = categorie.find((c) => c.nome === categoryName)?.id;
      if (!catId) return;

      const monthNamesLocal = [
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
      ];

      const monthIndex = monthNamesLocal.indexOf(monthName);
      if (monthIndex === -1) return;

      const start = new Date(selectedYear, monthIndex, 1);
      const end = new Date(selectedYear, monthIndex + 1, 0);

      setDialogFilters({
        categoria_id: catId,
        data_inizio: toDateStr(start),
        data_fine: toDateStr(end),
      });
      setDialogTitle(
        `${t("nav_transactions")} - ${categoryName} (${monthName})`,
      );
      setIsDialogVisible(true);
    }
  };

  // Opzioni Anno
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear - 5; y <= currentYear; y++) {
      years.push({ label: y.toString(), value: y });
    }
    return years.reverse();
  }, [currentYear]);

  // Caricamento inizialie
  useEffect(() => {
    dispatch(getCategorie());
  }, [dispatch]);

  // Mapping dei nomi delle sottocategorie agli ID quando selectedCategoriaId è impostato
  const subcategoryNameToIdMap = useMemo(() => {
    if (!selectedCategoriaId) return new Map<string, string>();

    const selectedCat = categorie.find((c) => c.id === selectedCategoriaId);
    if (!selectedCat || !selectedCat.sottocategorie) return new Map();

    const map = new Map<string, string>();
    selectedCat.sottocategorie.forEach((sc) => {
      map.set(sc.nome, sc.id);
    });
    return map;
  }, [selectedCategoriaId, categorie]);

  // Fetch dati
  useEffect(() => {
    dispatch(
      getYearDetailsStatistics({
        year: selectedYear,
        categoria_id: selectedCategoriaId,
      }),
    );
  }, [dispatch, selectedYear, selectedCategoriaId]);

  // 1. Uniformiamo i dati per i mesi
  const tableData = useMemo(() => {
    const monthNames = [
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
    ];

    return monthNames.map((monthName, index) => {
      const rawMonthData = Array.isArray(data)
        ? data.find((d) => d.month === index + 1)
        : undefined;
      const { month: _, ...restData } = (rawMonthData || {}) as any;

      return {
        month: monthName,
        monthId: index + 1,
        ...restData,
      };
    });
  }, [data, t]);

  // 2. "RIBALTIAMO" I DATI: Da Mesi->Categorie a Categorie->Mesi (Perfetto per le CustomCard)
  const categoriesSummary = useMemo(() => {
    // Usiamo una mappa per accumulare i totali e i mesi per ogni singola categoria
    const categoryMap = new Map<
      string,
      {
        total: number;
        months: { monthName: string; value: number; monthId: number }[];
      }
    >();

    tableData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "month" && key !== "monthId") {
          const val = row[key] as number;
          // Ignoriamo i mesi a 0 per non sporcare la UI
          if (val !== 0) {
            if (!categoryMap.has(key)) {
              categoryMap.set(key, { total: 0, months: [] });
            }
            const catData = categoryMap.get(key)!;
            catData.total += val;
            catData.months.push({
              monthName: row.month as string,
              value: val,
              monthId: row.monthId as number,
            });
          }
        }
      });
    });

    // Convertiamo in array e ordiniamo per nome categoria
    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        categoria: name,
        totale: data.total,
        // Usiamo "sottocategoria" per ospitare in realtà il nome del Mese
        sottocategorie: data.months
          .sort((a, b) => a.monthId - b.monthId) // Ordine cronologico
          .map((m) => ({
            sottocategoria: m.monthName,
            totale: m.value,
          })),
      }))
      .sort((a, b) => a.categoria.localeCompare(b.categoria));
  }, [tableData]);

  // 3. Dividiamo le categorie generate in Entrate e Uscite basandoci sul totale annuale
  const incomes = categoriesSummary.filter((c) => c.totale > 0);
  const expenses = categoriesSummary.filter((c) => c.totale < 0);
  const others = categoriesSummary.filter((c) => c.totale === 0);

  // Calcolo totali annuali
  const totalIncomes = incomes.reduce((acc, cat) => acc + cat.totale, 0);
  const totalExpenses = expenses.reduce((acc, cat) => acc + cat.totale, 0);

  return (
    <div className="yearly-statistics-page">
      <header className="page-header">
        <div className="filters-row">
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

      <div className="split-wrapper">
        <section className="statistics-list">
          <div className="scrollable-area">
            {loading ? (
              <p className="no-data">{t("loading_data")}</p>
            ) : categoriesSummary.length === 0 ? (
              <p className="no-data">{t("no_data")}</p>
            ) : (
              <>
                {/* ENTRATE */}
                {incomes.length > 0 && (
                  <div className="category-section">
                    <h3>{t("income")}</h3>
                    <div className="categories-grid">
                      {incomes.map((cat) => (
                        <CustomCard
                          key={cat.categoria}
                          title={cat.categoria}
                          totale={cat.totale}
                          sottocategorie={cat.sottocategorie}
                          onClick={handleCategoryClick}
                          onSubcategoryClick={handleSubcategoryClick}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* USCITE */}
                {expenses.length > 0 && (
                  <div className="category-section">
                    <h3>{t("expenses")}</h3>
                    <div className="categories-grid">
                      {expenses.map((cat) => (
                        <CustomCard
                          key={cat.categoria}
                          title={cat.categoria}
                          totale={cat.totale}
                          sottocategorie={cat.sottocategorie}
                          onClick={handleCategoryClick}
                          onSubcategoryClick={handleSubcategoryClick}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
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
