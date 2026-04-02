import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getYearDetailsStatistics } from "../../../features/statistics/api_calls";
import {
  selectYearlyStatisticsData,
  selectStatisticsLoading,
} from "../../../features/statistics/statistics_slice";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { getCategorie } from "../../../features/categorie/api_calls";
import { selectTagTags } from "../../../features/tags/tag_slice"; // <-- Aggiunto
import { getTags } from "../../../features/tags/api_calls"; // <-- Aggiunto
import Dropdown from "../../../components/dropdown/dropdown";
import { useI18n } from "../../../i18n/use-i18n";
import CustomCard from "../../../components/custom_card/custom_card";
import TransactionsListDialog from "../../../components/dialog/transactions_list_dialog/transactions_list_dialog";
import "./year_statistics.scss";

export default function YearStatistics() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Selettori Redux
  const data = useAppSelector(selectYearlyStatisticsData);
  const loading = useAppSelector(selectStatisticsLoading);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const tags = useAppSelector(selectTagTags); // <-- Aggiunto

  // Stati locali per i filtri
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
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
        tag_id: selectedTagId || undefined, // <-- Passiamo il tag
        data_inizio: toDateStr(start),
        data_fine: toDateStr(end),
      });
      setDialogTitle(`${t("nav_transactions")} - ${categoryName}`);
      setIsDialogVisible(true);
    } else {
      const catId = categorie.find((c) => c.nome === categoryName)?.id;
      if (!catId) return;

      const start = new Date(selectedYear, 0, 1);
      const end = new Date(selectedYear, 11, 31);

      setDialogFilters({
        categoria_id: catId,
        tag_id: selectedTagId || undefined, // <-- Passiamo il tag
        data_inizio: toDateStr(start),
        data_fine: toDateStr(end),
      });
      setDialogTitle(`${t("nav_transactions")} - ${categoryName}`);
      setIsDialogVisible(true);
    }
  };

  const handleSubcategoryClick = (monthName: string, categoryName: string) => {
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

    if (selectedCategoriaId) {
      const selectedCat = categorie.find((c) => c.id === selectedCategoriaId);
      if (!selectedCat) return;

      const subCat = selectedCat.sottocategorie?.find(
        (s) => s.nome === categoryName,
      );
      if (!subCat) return;

      setDialogFilters({
        categoria_id: selectedCat.id,
        sottocategoria_id: subCat.id,
        tag_id: selectedTagId || undefined, // <-- Passiamo il tag
        data_inizio: toDateStr(start),
        data_fine: toDateStr(end),
      });
      setDialogTitle(
        `${t("nav_transactions")} - ${categoryName} (${monthName})`,
      );
      setIsDialogVisible(true);
    } else {
      const catId = categorie.find((c) => c.nome === categoryName)?.id;
      if (!catId) return;

      setDialogFilters({
        categoria_id: catId,
        tag_id: selectedTagId || undefined, // <-- Passiamo il tag
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

  // Caricamento iniziale
  useEffect(() => {
    dispatch(getCategorie());
    dispatch(getTags()); // <-- Carichiamo i tag
  }, [dispatch]);

  // Fetch dati statistici
  useEffect(() => {
    dispatch(
      getYearDetailsStatistics({
        year: selectedYear,
        categoria_id: selectedCategoriaId,
        tag_id: selectedTagId, // <-- Passiamo il tag all'API
      }),
    );
  }, [dispatch, selectedYear, selectedCategoriaId, selectedTagId]);

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

  const categoriesSummary = useMemo(() => {
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

    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        categoria: name,
        totale: data.total,
        sottocategorie: data.months
          .sort((a, b) => a.monthId - b.monthId)
          .map((m) => ({
            sottocategoria: m.monthName,
            totale: m.value,
          })),
      }))
      .sort((a, b) => a.categoria.localeCompare(b.categoria));
  }, [tableData]);

  const incomes = categoriesSummary.filter((c) => c.totale > 0);
  const expenses = categoriesSummary.filter((c) => c.totale < 0);

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
