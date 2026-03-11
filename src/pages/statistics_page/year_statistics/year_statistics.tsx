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
import TableVisualization, {
  VisualizationColumnProps,
} from "../../../components/table_visualization/table_visualization";
import { useI18n } from "../../../i18n/use-i18n";
import "./year_statistics.scss"; // Crea questo file per lo stile

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

  // Opzioni Anno (es. da 5 anni fa all'anno prossimo)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear - 5; y <= currentYear; y++) {
      years.push({ label: y.toString(), value: y });
    }
    return years.reverse(); // Dal più recente
  }, [currentYear]);

  // Caricamento Categorie all'avvio
  useEffect(() => {
    dispatch(getCategorie());
  }, [dispatch]);

  // Fetch dati statistici quando cambiano anno o categoria
  useEffect(() => {
    dispatch(
      getYearDetailsStatistics({
        year: selectedYear,
        categoria_id: selectedCategoriaId,
      }),
    );
  }, [dispatch, selectedYear, selectedCategoriaId]);

  // 1. Uniformiamo i dati per mostrare sempre 12 righe (mesi)
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
      // 1. Troviamo i dati del mese
      const rawMonthData = data.find((d) => d.month === index + 1) || {};

      // 2. Destrutturiamo togliendo la proprietà 'month' originale
      // (la assegniamo a una variabile '_' che non useremo, il resto finisce in 'restData')
      const { month: _, ...restData } = rawMonthData as any;

      return {
        month: monthName, // Adesso questa sarà l'unica proprietà "month"
        monthId: index + 1,
        ...restData, // Qui ci sono solo le categorie (Spesa, Stipendio, ecc.)
      };
    });
  }, [data, t]);

  // 2. Generazione DINAMICA delle colonne
  const columns: VisualizationColumnProps[] = useMemo(() => {
    const dynamicKeys = new Set<string>();

    tableData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "month" && key !== "monthId") {
          dynamicKeys.add(key);
        }
      });
    });

    const cols: VisualizationColumnProps[] = [
      {
        field: "month",
        header: t("month"),
        body: (row: any) => <strong>{row.month}</strong>,
      },
    ];

    // Aggiungiamo una colonna per ogni categoria/sottocategoria trovata nei dati
    Array.from(dynamicKeys)
      .sort()
      .forEach((key) => {
        // --- CALCOLO TOTALE E MEDIA ---
        const totalValue = tableData.reduce(
          (sum, row) => sum + (row[key] || 0),
          0,
        );

        cols.push({
          field: key,
          header: (
            <div className="column-header-with-total">
              <span className="col-title">{key}</span>
              <div>
                <span
                  className={`value-${totalValue > 0 ? "high" : ""}${totalValue < 0 ? "low" : ""}`}
                >
                  {totalValue !== 0
                    ? ` ${totalValue > 0 ? "+" : ""}${totalValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })} €`
                    : " 0,00 €"}
                </span>
              </div>
            </div>
          ),
          body: (row: any) => {
            const value = row[key] || 0;
            return (
              <span
                className={`value-${value > 0 ? "high" : ""}${value < 0 ? "low" : ""}`}
              >
                {value !== 0
                  ? `${value > 0 ? "+" : ""}${value.toLocaleString("it-IT", { minimumFractionDigits: 2 })} €`
                  : "-"}
              </span>
            );
          },
        });
      });

    return cols;
  }, [tableData, t]);

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
            showClear // Permette di svuotare la selezione per tornare alla vista principale
          />
        </div>
      </header>

      <TableVisualization
        className="statistics-table"
        value={tableData}
        columns={columns}
        loading={loading}
      />
    </div>
  );
}
