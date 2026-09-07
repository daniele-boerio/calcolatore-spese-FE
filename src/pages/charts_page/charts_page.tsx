import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useI18n } from "../../i18n/use-i18n";
import { getLocale } from "../../i18n";
import { Card, CardTitle } from "../../components/card/card";
import Amount from "../../components/amount/amount";
import EmptyState from "../../components/empty_state/empty_state";
import SkeletonList from "../../components/skeleton/skeleton";
import {
  getCategoryTrendChart,
  getExpenseCompositionChart,
  getIncomeExpenseChart,
  getSavingsChart,
} from "../../features/charts/api_calls";
import {
  selectChartsCategoryTrend,
  selectChartsExpenseComposition,
  selectChartsIncomeExpense,
  selectChartsLoading,
  selectChartsSavings,
} from "../../features/charts/charts_slice";
import { selectCategoriaCategorie } from "../../features/categorie/categoria_slice";
import { buildTrend, Trend } from "../../features/statistics/trend";
import { endOfMonth, toIsoDate } from "../../services/dates";
import "./charts_page.scss";

// Coordinate dei grafici a linea, nelle unità del `viewBox`. Sono le stesse
// della vista Anno: le due schermate stanno nella stessa pillola, a un tocco
// di distanza, e due grafici alti diversi si notano.
const TREND_BOX = {
  width: 360,
  padX: 8,
  top: 18,
  bottom: 108,
  baseline: 124,
};

// Ciambella: diametro e spessore dell'anello, in unità del `viewBox`.
const DONUT_SIZE = 132;
const DONUT_STROKE = 18;

// Le tinte della serie sono cinque: dalla sesta categoria in giù si sommano
// tutte in "Altro", che ha la sua tinta neutra.
const TOP_SLICES = 5;

const localeTag = () => (getLocale() === "it" ? "it-IT" : "en-GB");

/** Iniziale del mese: dodici colonne non hanno spazio per "gen", "feb", … */
const monthInitial = (year: number, month: number) =>
  new Intl.DateTimeFormat(localeTag(), { month: "narrow" }).format(
    new Date(year, month - 1, 1),
  );

type ChartsProps = {
  year: number;
  /** Dai filtri della schermata: decide di quale categoria è l'andamento. */
  categoriaId: string | null;
};

/**
 * La terza vista dell'Analisi: l'anno intero, in quattro grafici.
 *
 * Il periodo non si sceglie qui — è l'anno della testata, come per le altre due
 * viste. Prima ogni card aveva la sua coppia di date e la categoria un menu a
 * tendina suo: quattro periodi diversi nella stessa schermata, e nessuno dei
 * quattro era quello scritto in cima.
 *
 * I grafici sono disegnati a mano in SVG come il resto dell'Analisi, non con
 * una libreria: è l'unico modo perché prendano i colori dai token del tema
 * (dentro un canvas le custom property non esistono) e perché al buio si
 * leggano senza doverli ridipingere da JavaScript.
 */
export default function ChartsPage({ year, categoriaId }: ChartsProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const incomeExpense = useAppSelector(selectChartsIncomeExpense);
  const savings = useAppSelector(selectChartsSavings);
  const composition = useAppSelector(selectChartsExpenseComposition);
  const categoryTrend = useAppSelector(selectChartsCategoryTrend);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const loading = useAppSelector(selectChartsLoading);

  // Nell'anno in corso la finestra si ferma al mese corrente: i mesi che non
  // sono ancora successi tornano a zero dal BE, e uno zero in fondo alla linea
  // del risparmio si legge come un crollo.
  const range = useMemo(() => {
    const today = new Date();
    const last = year === today.getFullYear() ? today : new Date(year, 11, 1);

    return {
      data_inizio: toIsoDate(new Date(year, 0, 1)),
      data_fine: toIsoDate(endOfMonth(last)),
    };
  }, [year]);

  useEffect(() => {
    dispatch(getIncomeExpenseChart(range));
    dispatch(getSavingsChart(range));
    dispatch(getExpenseCompositionChart(range));
  }, [dispatch, range]);

  useEffect(() => {
    if (!categoriaId) return;

    dispatch(getCategoryTrendChart({ categoria_id: categoriaId, ...range }));
  }, [dispatch, categoriaId, range]);

  // Il BE riempie di zeri i mesi senza movimenti: l'asse c'è tutto anche
  // quando i dati no, e le colonne restano nella stessa posizione da un anno
  // all'altro.
  const months = useMemo(
    () =>
      incomeExpense.map((row) => ({
        month: Number(row.label),
        entrate: Math.abs(row.entrate),
        uscite: Math.abs(row.uscite),
        accantonamento: Math.abs(row.accantonamento ?? 0),
      })),
    [incomeExpense],
  );

  // La colonna delle uscite è impilata con l'accantonamento: sono due modi di
  // far uscire soldi dal portafoglio, e una terza barra appaiata avrebbe dato
  // trentasei barre in trecento pixel.
  const peak = Math.max(
    ...months.map((entry) =>
      Math.max(entry.entrate, entry.uscite + entry.accantonamento),
    ),
    0,
  );

  const savingsSeries = savings.map((row) => Number(row.risparmio));
  const savingsTrend = buildTrend(savingsSeries, TREND_BOX);

  const slices = useMemo(() => {
    const sorted = composition
      .map((row) => ({ nome: row.categoria, totale: Math.abs(row.totale) }))
      .filter((row) => row.totale > 0)
      .sort((a, b) => b.totale - a.totale);

    const top = sorted.slice(0, TOP_SLICES);
    const rest = sorted.slice(TOP_SLICES);

    if (rest.length > 0) {
      top.push({
        nome: t("other"),
        totale: rest.reduce((sum, row) => sum + row.totale, 0),
      });
    }

    return top;
  }, [composition, t]);

  const compositionTotal = slices.reduce((sum, slice) => sum + slice.totale, 0);

  const radius = (DONUT_SIZE - DONUT_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  // Gli archi della ciambella: ognuno è un cerchio tratteggiato lungo quanto la
  // sua fetta e spostato di quanto misurano tutte quelle prima. Lo scorrimento
  // si ricalcola invece di accumularsi in una variabile: le fette sono al
  // massimo sei, e una somma parziale è più facile da leggere di un contatore
  // che cambia sotto al `map`.
  const arcs = useMemo(() => {
    const shares = slices.map((slice) =>
      compositionTotal > 0 ? slice.totale / compositionTotal : 0,
    );

    return slices.map((slice, index) => {
      const before = shares
        .slice(0, index)
        .reduce((sum, share) => sum + share, 0);

      return {
        ...slice,
        index,
        share: shares[index],
        length: shares[index] * circumference,
        offset: before * circumference,
      };
    });
  }, [slices, compositionTotal, circumference]);

  const trendSeries = categoryTrend.map((row) => Math.abs(Number(row.spesa)));
  const categoryChart = categoriaId ? buildTrend(trendSeries, TREND_BOX) : null;
  const categoriaNome = categorie.find(
    (item) => String(item.id) === String(categoriaId),
  )?.nome;

  if (loading && months.length === 0) {
    return (
      <Card>
        <SkeletonList />
      </Card>
    );
  }

  const hasData = months.some(
    (entry) =>
      entry.entrate > 0 || entry.uscite > 0 || entry.accantonamento > 0,
  );

  if (!hasData) {
    return (
      <EmptyState
        icon="pi pi-chart-bar"
        title={t("analysis_empty_title")}
        description={t("analysis_empty_text")}
      />
    );
  }

  const sliceClass = (index: number) =>
    index < TOP_SLICES ? String(index + 1) : "rest";

  return (
    <>
      <Card>
        <CardTitle aside={String(year)}>{t("analysis_in_and_out")}</CardTitle>

        <div
          className="year-columns"
          role="img"
          aria-label={t("analysis_in_and_out")}
        >
          {months.map((entry) => (
            <div className="year-columns__group" key={entry.month}>
              <div className="year-columns__pair">
                <span
                  className="year-columns__bar year-columns__bar--in"
                  style={{
                    height: `${peak > 0 ? (entry.entrate / peak) * 100 : 0}%`,
                  }}
                />

                <span className="year-columns__stack">
                  <span
                    className="year-columns__bar year-columns__bar--aside"
                    style={{
                      height: `${
                        peak > 0 ? (entry.accantonamento / peak) * 100 : 0
                      }%`,
                    }}
                  />
                  <span
                    className="year-columns__bar year-columns__bar--out"
                    style={{
                      height: `${peak > 0 ? (entry.uscite / peak) * 100 : 0}%`,
                    }}
                  />
                </span>
              </div>

              <span className="year-columns__label">
                {monthInitial(year, entry.month)}
              </span>
            </div>
          ))}
        </div>

        <div className="chart-legend">
          <LegendDot variant="in" label={t("income")} />
          <LegendDot variant="out" label={t("expenses")} />
          <LegendDot variant="aside" label={t("set_aside")} />
        </div>
      </Card>

      {savingsTrend && (
        <Card>
          <CardTitle
            aside={
              <span
                className={`chart-badge chart-badge--${
                  savingsTrend.slope >= 0 ? "up" : "down"
                }`}
              >
                {savingsTrend.slope >= 0
                  ? t("analysis_trend_up")
                  : t("analysis_trend_down")}
              </span>
            }
          >
            {t("analysis_savings_trend")}
          </CardTitle>

          <TrendChart trend={savingsTrend} label={t("analysis_savings_trend")} />

          <div className="chart-axis">
            {savings.map((row) => (
              <span key={row.label}>
                {monthInitial(year, Number(row.label))}
              </span>
            ))}
          </div>

          <div className="chart-legend">
            <LegendDot variant="line" label={t("savings")} />
            <LegendDot variant="guide" label={t("trendline")} />
          </div>
        </Card>
      )}

      {slices.length > 0 && (
        <Card>
          <CardTitle>{t("expense_composition")}</CardTitle>

          <div className="donut">
            <svg
              className="donut__chart"
              viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
              role="img"
              aria-label={t("expense_composition")}
            >
              <g transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}>
                {arcs.map((arc) => {
                  // Due unità di stacco fra una fetta e l'altra: senza, due
                  // categorie vicine nella scala dei verdi si fondono.
                  const drawn = Math.max(arc.length - 2, 0);

                  return (
                    <circle
                      key={arc.nome}
                      className={`donut__arc donut__arc--${sliceClass(arc.index)}`}
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={radius}
                      strokeWidth={DONUT_STROKE}
                      strokeDasharray={`${drawn} ${circumference - drawn}`}
                      strokeDashoffset={-arc.offset}
                    />
                  );
                })}
              </g>
            </svg>

            <ul className="donut__legend">
              {arcs.map((arc) => (
                <li className="donut__row" key={arc.nome}>
                  <span
                    className={`donut__dot donut__dot--${sliceClass(arc.index)}`}
                    aria-hidden="true"
                  />
                  <span className="donut__name">{arc.nome}</span>
                  <span className="donut__share">
                    {`${Math.round(arc.share * 100)}%`}
                  </span>
                  <Amount className="donut__value" value={arc.totale} />
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <Card>
        <CardTitle aside={categoriaNome}>{t("category_trend")}</CardTitle>

        {!categoriaId ? (
          <p className="chart-hint">{t("charts_pick_category")}</p>
        ) : !categoryChart || trendSeries.every((value) => value === 0) ? (
          <p className="chart-hint">{t("no_data")}</p>
        ) : (
          <>
            <TrendChart trend={categoryChart} label={t("category_trend")} />

            <div className="chart-axis">
              {categoryTrend.map((row) => (
                <span key={row.label}>
                  {monthInitial(year, Number(row.label))}
                </span>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}

/** Linea, area sotto e retta di tendenza: la stessa forma della vista Anno. */
function TrendChart({ trend, label }: { trend: Trend; label: string }) {
  const last = trend.points[trend.points.length - 1];

  return (
    <svg
      className="chart-trend"
      viewBox={`0 0 ${TREND_BOX.width} ${TREND_BOX.baseline + 8}`}
      role="img"
      aria-label={label}
    >
      <polygon className="chart-trend__area" points={trend.area} />
      <polyline className="chart-trend__line" points={trend.line} />

      {trend.guide && (
        <line
          className="chart-trend__guide"
          x1={trend.guide.x1}
          y1={trend.guide.y1}
          x2={trend.guide.x2}
          y2={trend.guide.y2}
        />
      )}

      <circle className="chart-trend__dot" cx={last.x} cy={last.y} r={5.5} />
    </svg>
  );
}

function LegendDot({
  variant,
  label,
}: {
  variant: "in" | "out" | "aside" | "line" | "guide";
  label: string;
}) {
  return (
    <span className="chart-legend__item">
      <span
        className={`chart-legend__dot chart-legend__dot--${variant}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
