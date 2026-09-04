import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { Card, CardTitle } from "../../../components/card/card";
import Amount from "../../../components/amount/amount";
import EmptyState from "../../../components/empty_state/empty_state";
import SkeletonList from "../../../components/skeleton/skeleton";
import { useI18n } from "../../../i18n/use-i18n";
import { getLocale } from "../../../i18n";
import "./year_statistics.scss";
import { getYearDetailsStatistics } from "../../../features/statistics/api_calls";
import {
  selectStatisticsLoading,
  selectYearlyStatisticsData,
  selectYearlyTotals,
} from "../../../features/statistics/statistics_slice";
import { buildTrend } from "../../../features/statistics/trend";
import { YearDetailsStatRow } from "../../../features/statistics/interfaces";

// Il design mostra una finestra di sei mesi: dodici barre appaiate non si
// leggono su 430px.
const WINDOW = 6;

// Coordinate del grafico di tendenza, nelle unità del `viewBox`.
const TREND_BOX = {
  width: 360,
  padX: 8,
  top: 20,
  bottom: 126,
  baseline: 142,
};

type YearStatisticsProps = {
  year: number;
  categoriaId: string | null;
  sottocategoriaId: string | null;
  tagId: string | null;
};

interface MonthTotals {
  month: number;
  entrate: number;
  uscite: number;
}

/**
 * Entrate e uscite di un mese. `yearDetails` manda una riga per mese con una
 * chiave per categoria e il segno dentro al valore: positivo entrata,
 * negativo uscita.
 */
const totalsOf = (row: YearDetailsStatRow): MonthTotals => {
  let entrate = 0;
  let uscite = 0;

  for (const [key, value] of Object.entries(row)) {
    if (key === "month") continue;

    if (value > 0) entrate += value;
    else uscite -= value;
  }

  return { month: Number(row.month), entrate, uscite };
};

export default function YearStatistics({
  year,
  categoriaId,
  sottocategoriaId,
  tagId,
}: YearStatisticsProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const rows = useAppSelector(selectYearlyStatisticsData);
  const totals = useAppSelector(selectYearlyTotals);
  const loading = useAppSelector(selectStatisticsLoading);

  useEffect(() => {
    dispatch(
      getYearDetailsStatistics({
        year,
        categoria_id: categoriaId,
        sottocategoria_id: sottocategoriaId,
        tag_id: tagId,
      }),
    );
  }, [dispatch, year, categoriaId, sottocategoriaId, tagId]);

  const today = new Date();
  // Nell'anno in corso la finestra finisce sul mese corrente; negli anni
  // passati sull'ultimo mese, che c'è tutto.
  const lastMonth = year === today.getFullYear() ? today.getMonth() + 1 : 12;

  const months = useMemo(() => {
    const all = rows.map(totalsOf).sort((a, b) => a.month - b.month);
    const end = all.findIndex((entry) => entry.month === lastMonth);

    const window = end >= 0 ? all.slice(0, end + 1) : all;
    return window.slice(-WINDOW);
  }, [rows, lastMonth]);

  const savings = months.map((month) => month.entrate - month.uscite);

  const peak = Math.max(
    ...months.flatMap((month) => [month.entrate, month.uscite]),
    0,
  );

  const average =
    savings.length > 0
      ? savings.reduce((sum, value) => sum + value, 0) / savings.length
      : 0;

  const trend = buildTrend(savings, TREND_BOX);

  const monthLabel = (month: number) =>
    new Intl.DateTimeFormat(getLocale() === "it" ? "it-IT" : "en-GB", {
      month: "short",
    }).format(new Date(year, month - 1, 1));

  const incomes = totals.incomes;
  // Le uscite arrivano negative dal BE: qui si scrivono in positivo.
  const expenses = Math.abs(totals.expenses);

  if (loading && rows.length === 0) {
    return (
      <Card>
        <SkeletonList />
      </Card>
    );
  }

  if (months.length === 0) {
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
      <Card className="year-card">
        <div className="year-card__heading">
          <span className="year-card__title">{t("analysis_in_and_out")}</span>
          <span className="year-card__subtitle">
            {`${t("analysis_average_savings")} `}
            <strong>
              <Amount value={average} decimals={0} />
            </strong>
            {` ${t("analysis_per_month")}`}
          </span>
        </div>

        <div className="year-bars">
          {months.map((month) => (
            <div className="year-bars__group" key={month.month}>
              <div className="year-bars__pair">
                <span
                  className="year-bars__bar year-bars__bar--in"
                  style={{ height: `${peak > 0 ? (month.entrate / peak) * 100 : 0}%` }}
                />
                <span
                  className={`year-bars__bar year-bars__bar--out${
                    month.month === lastMonth ? " year-bars__bar--current" : ""
                  }`}
                  style={{ height: `${peak > 0 ? (month.uscite / peak) * 100 : 0}%` }}
                />
              </div>

              <span
                className={`year-bars__label${
                  month.month === lastMonth ? " year-bars__label--current" : ""
                }`}
              >
                {monthLabel(month.month)}
              </span>
            </div>
          ))}
        </div>

        <div className="year-legend">
          <LegendItem variant="in" label={t("income")} />
          <LegendItem variant="out" label={t("expenses")} />
          <LegendItem variant="current" label={t("analysis_current_month")} />
        </div>
      </Card>

      {trend && (
        <Card>
          <CardTitle
            aside={
              <span
                className={`year-trend__badge year-trend__badge--${
                  trend.slope >= 0 ? "up" : "down"
                }`}
              >
                {trend.slope >= 0
                  ? t("analysis_trend_up")
                  : t("analysis_trend_down")}
              </span>
            }
          >
            {t("analysis_savings_trend")}
          </CardTitle>

          <svg
            className="year-trend__chart"
            viewBox={`0 0 ${TREND_BOX.width} 150`}
            role="img"
            aria-label={t("analysis_savings_trend")}
          >
            <polygon className="year-trend__area" points={trend.area} />
            <polyline className="year-trend__line" points={trend.line} />

            {trend.guide && (
              <line
                className="year-trend__guide"
                x1={trend.guide.x1}
                y1={trend.guide.y1}
                x2={trend.guide.x2}
                y2={trend.guide.y2}
              />
            )}

            <circle
              className="year-trend__dot"
              cx={trend.points[trend.points.length - 1].x}
              cy={trend.points[trend.points.length - 1].y}
              r={5.5}
            />
          </svg>

          <div className="year-trend__labels">
            {months.map((month) => (
              <span key={month.month}>{monthLabel(month.month)}</span>
            ))}
          </div>
        </Card>
      )}

      <Card className="year-totals">
        <TotalRow label={`${t("income")} ${year}`} value={incomes} />
        <TotalRow label={`${t("expenses")} ${year}`} value={expenses} />
        <TotalRow label={t("set_aside")} value={totals.accantonamento} />

        <div className="year-totals__row year-totals__row--net">
          <span className="year-totals__label">{t("analysis_net_savings")}</span>
          <Amount
            className="year-totals__net"
            value={incomes - expenses}
            sign="always"
            tone={incomes - expenses >= 0 ? "positive" : "negative"}
          />
        </div>
      </Card>
    </>
  );
}

function LegendItem({
  variant,
  label,
}: {
  variant: "in" | "out" | "current";
  label: string;
}) {
  return (
    <span className="year-legend__item">
      <span
        className={`year-legend__dot year-legend__dot--${variant}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="year-totals__row">
      <span className="year-totals__label">{label}</span>
      <Amount className="year-totals__value" value={value} />
    </div>
  );
}
