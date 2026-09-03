import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { Card, CardTitle } from "../../../components/card/card";
import Amount from "../../../components/amount/amount";
import EmptyState from "../../../components/empty_state/empty_state";
import SkeletonList from "../../../components/skeleton/skeleton";
import { useI18n } from "../../../i18n/use-i18n";
import "./month_statistics.scss";
import {
  getMonthRefunds,
  getMonthlyDetailsStatistics,
  getPreviousMonthSavings,
} from "../../../features/statistics/api_calls";
import {
  selectMonthRefunds,
  selectMonthlyStatisticsData,
  selectMonthlyTotals,
  selectPreviousMonthSavings,
  selectStatisticsLoading,
} from "../../../features/statistics/statistics_slice";
import { buildInsights, Insight } from "../../../features/statistics/insights";
import { getExpenseCompositionChart } from "../../../features/charts/api_calls";
import { selectChartsExpenseComposition } from "../../../features/charts/charts_slice";
import { getCategorie } from "../../../features/categorie/api_calls";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { addMonths, endOfMonth, startOfMonth, toIsoDate } from "../../../services/dates";

// Mesi su cui si misura il "sopra media" e categorie mostrate: entrambi dal
// design, e le tinte della serie grafici sono cinque.
const AVERAGE_MONTHS = 3;
const TOP_CATEGORIES = 5;

const ICONS: Record<Insight["kind"], string> = {
  above_average: "pi pi-arrow-up-right",
  concentration: "pi pi-chart-pie",
  overspent: "pi pi-exclamation-circle",
  saved_share: "pi pi-check",
};

type MonthStatisticsProps = {
  year: number;
  month: number;
  tagId: string | null;
};

export default function MonthStatistics({
  year,
  month,
  tagId,
}: MonthStatisticsProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const data = useAppSelector(selectMonthlyStatisticsData);
  const totals = useAppSelector(selectMonthlyTotals);
  const previous = useAppSelector(selectPreviousMonthSavings);
  const refunds = useAppSelector(selectMonthRefunds);
  const composition = useAppSelector(selectChartsExpenseComposition);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const loading = useAppSelector(selectStatisticsLoading);

  useEffect(() => {
    dispatch(getCategorie());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getMonthlyDetailsStatistics({ year, month, tag_id: tagId }));
    dispatch(getPreviousMonthSavings({ year, month, tag_id: tagId }));
    dispatch(getMonthRefunds({ year, month, tag_id: tagId }));

    // Media per categoria dei mesi *precedenti*: il mese corrente è quello da
    // confrontare, includerlo appiattirebbe lo scostamento.
    const selected = new Date(year, month - 1, 1);
    dispatch(
      getExpenseCompositionChart({
        data_inizio: toIsoDate(startOfMonth(addMonths(selected, -AVERAGE_MONTHS))),
        data_fine: toIsoDate(endOfMonth(addMonths(selected, -1))),
      }),
    );
  }, [dispatch, year, month, tagId]);

  const averages = useMemo(
    () =>
      Object.fromEntries(
        composition.map((entry) => [
          entry.categoria,
          Number(entry.totale) / AVERAGE_MONTHS,
        ]),
      ),
    [composition],
  );

  // `monthDetails` manda le uscite col segno meno: qui si ragiona in valore
  // assoluto, il segno lo rimette la scrittura.
  const expenses = useMemo(
    () =>
      data
        .filter((category) => category.totale < 0)
        .map((category) => ({
          nome: category.categoria,
          totale: Math.abs(category.totale),
        }))
        .sort((a, b) => b.totale - a.totale),
    [data],
  );

  const insights = useMemo(
    () =>
      buildInsights({
        categories: data,
        averages,
        savings: totals.total,
        income: totals.incomes,
      }),
    [data, averages, totals.total, totals.incomes],
  );

  const income = totals.incomes;
  const spent = Math.abs(totals.expenses);
  const savedAside = totals.accantonamento;
  const savings = totals.total;

  // I tre segmenti sono quote delle entrate: senza entrate non c'è barra da
  // disegnare, e dividere per zero darebbe una barra piena a caso.
  const share = (value: number) => (income > 0 ? (value / income) * 100 : 0);

  const delta =
    previous !== null && previous !== 0
      ? Math.round(((savings - previous) / Math.abs(previous)) * 100)
      : null;

  const openCategory = (nome: string) => {
    const categoria = categorie.find((item) => item.nome === nome);
    if (!categoria) return;

    // Il periodo viaggia con il link: la pagina di dettaglio apre sullo stesso
    // mese che si stava guardando, non su quello corrente.
    const query = new URLSearchParams({
      anno: String(year),
      mese: String(month),
    });
    if (tagId) query.set("tag", tagId);

    navigate(`/categories/${categoria.id}?${query.toString()}`);
  };

  const sentence = (insight: Insight) => {
    switch (insight.kind) {
      case "above_average":
        return {
          strong: `${insight.category} +${insight.percent}%`,
          rest: ` ${t("analysis_insight_above_average")}`,
        };
      case "concentration":
        return {
          strong: `${insight.category} ${insight.percent}%`,
          rest: ` ${t("analysis_insight_concentration")}`,
        };
      case "overspent":
        return { strong: t("analysis_insight_overspent"), rest: "" };
      case "saved_share":
        return {
          strong: `${insight.percent}%`,
          rest: ` ${t("analysis_insight_saved_share")}`,
        };
    }
  };

  if (loading && data.length === 0) {
    return (
      <Card>
        <SkeletonList />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon="pi pi-chart-bar"
        title={t("analysis_empty_title")}
        description={t("analysis_empty_text")}
      />
    );
  }

  return (
    <>
      <Card className="savings-card">
        <div className="savings-card__top">
          <div className="savings-card__headline">
            <span className="savings-card__eyebrow">
              {t("analysis_month_savings")}
            </span>
            <Amount
              className="savings-card__value"
              value={savings}
              tone={savings >= 0 ? "positive" : "negative"}
            />
          </div>

          {delta !== null && (
            <span
              className={`savings-card__delta savings-card__delta--${
                delta >= 0 ? "up" : "down"
              }`}
            >
              <i
                className={`pi ${delta >= 0 ? "pi-arrow-up-right" : "pi-arrow-down-right"}`}
                aria-hidden="true"
              />
              {`${Math.abs(delta)}%`}
            </span>
          )}
        </div>

        <div className="savings-card__bar">
          <span
            className="savings-card__segment savings-card__segment--spent"
            style={{ width: `${share(spent)}%` }}
          />
          <span
            className="savings-card__segment savings-card__segment--aside"
            style={{ width: `${share(savedAside)}%` }}
          />
          <span
            className="savings-card__segment savings-card__segment--left"
            style={{ width: `${share(Math.max(savings, 0))}%` }}
          />
        </div>

        <div className="savings-card__legend">
          <LegendRow
            variant="spent"
            label={t("expenses")}
            value={spent}
          />
          <LegendRow
            variant="aside"
            label={t("set_aside")}
            value={savedAside}
          />
          <LegendRow
            variant="left"
            label={t("analysis_left")}
            value={Math.max(savings, 0)}
          />
        </div>

        <div className="savings-card__footer">
          <span>
            {`${t("income")} `}
            <strong>
              <Amount value={income} />
            </strong>
          </span>
          <span>
            {`${t("compensations")} `}
            <strong>
              <Amount value={refunds} />
            </strong>
          </span>
        </div>
      </Card>

      <Card>
        <CardTitle aside={t("analysis_tap_for_transactions")}>
          {t("analysis_expenses_by_category")}
        </CardTitle>

        {expenses.length === 0 ? (
          <p className="analysis-muted">{t("no_data")}</p>
        ) : (
          <div className="category-bars">
            {expenses.slice(0, TOP_CATEGORIES).map((category, index) => {
              const percent = spent > 0 ? (category.totale / spent) * 100 : 0;

              return (
                <button
                  type="button"
                  className="category-bars__row"
                  key={category.nome}
                  onClick={() => openCategory(category.nome)}
                >
                  <span className="category-bars__body">
                    <span className="category-bars__line">
                      <span className="category-bars__name">
                        {category.nome}
                      </span>
                      <span className="category-bars__figure">
                        {`${Math.round(percent)}% · `}
                        <strong>
                          <Amount value={category.totale} />
                        </strong>
                      </span>
                    </span>

                    <span className="category-bars__track">
                      <span
                        className={`category-bars__fill category-bars__fill--${index + 1}`}
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                  </span>

                  <i
                    className="pi pi-chevron-right category-bars__chevron"
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {insights.length > 0 && (
        <Card>
          <CardTitle>{t("analysis_notable")}</CardTitle>

          {insights.map((insight) => {
            const { strong, rest } = sentence(insight);

            return (
              <div className="insight" key={insight.kind}>
                <span
                  className={`insight__icon insight__icon--${insight.tone}`}
                  aria-hidden="true"
                >
                  <i className={ICONS[insight.kind]} />
                </span>

                <span className="insight__text">
                  <strong>{strong}</strong>
                  {rest}
                </span>
              </div>
            );
          })}
        </Card>
      )}

    </>
  );
}

function LegendRow({
  variant,
  label,
  value,
}: {
  variant: "spent" | "aside" | "left";
  label: string;
  value: number;
}) {
  return (
    <div className="savings-card__legend-row">
      <span className="savings-card__legend-label">
        <span
          className={`savings-card__dot savings-card__dot--${variant}`}
          aria-hidden="true"
        />
        {label}
      </span>
      <Amount value={value} />
    </div>
  );
}
