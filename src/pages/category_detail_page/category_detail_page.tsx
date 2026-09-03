import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useI18n } from "../../i18n/use-i18n";
import { getLocale } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { Page, PageContent, PageHeader } from "../../components/page/page";
import { Card, CardTitle } from "../../components/card/card";
import ListRow, { List } from "../../components/list_row/list_row";
import SectionHeader from "../../components/section_header/section_header";
import Amount from "../../components/amount/amount";
import EmptyState from "../../components/empty_state/empty_state";
import SkeletonList from "../../components/skeleton/skeleton";
import PeriodSheet from "../../components/dialog/period_sheet/period_sheet";
import "./category_detail_page.scss";
import { getCategoryTrendChart } from "../../features/charts/api_calls";
import { selectChartsCategoryTrend } from "../../features/charts/charts_slice";
import { getMonthlyDetailsStatistics } from "../../features/statistics/api_calls";
import {
  selectMonthlyStatisticsData,
  selectStatisticsLoading,
} from "../../features/statistics/statistics_slice";
import { buildTrend } from "../../features/statistics/trend";
import { getCategorie } from "../../features/categorie/api_calls";
import { selectCategoriaCategorie } from "../../features/categorie/categoria_slice";
import { getTags } from "../../features/tags/api_calls";
import { getTransactionsByCategory } from "../../features/transactions/api_calls";
import { Transaction } from "../../features/transactions/interfaces";
import { mapTransaction } from "../../features/transactions/transaction_slice";
import { displayAmount } from "../../features/transactions/group";
import { transactionIcon } from "../../features/transactions/icons";
import { openSheet } from "../../features/ui/ui_slice";
import { addMonths, startOfMonth, toIsoDate } from "../../services/dates";

// Finestra dello sparkline: il mese corrente più i cinque precedenti.
const TREND_MONTHS = 6;

const SPARK_BOX = {
  width: 360,
  padX: 10,
  top: 18,
  bottom: 96,
  baseline: 110,
};

const localeTag = () => (getLocale() === "it" ? "it-IT" : "en-GB");

/**
 * Una categoria vista da sola: quanto è costata questo mese contro la media
 * dei sei, come si divide fra sottocategorie, e i movimenti che la compongono.
 * Prima era un dialog aperto dalle statistiche.
 */
export default function CategoryDetailPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [periodOpen, setPeriodOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const today = new Date();
  const year = Number(searchParams.get("anno")) || today.getFullYear();
  const month = Number(searchParams.get("mese")) || today.getMonth() + 1;
  const tagId = searchParams.get("tag");

  const categorie = useAppSelector(selectCategoriaCategorie);
  const monthlyData = useAppSelector(selectMonthlyStatisticsData);
  const trendData = useAppSelector(selectChartsCategoryTrend);
  const loading = useAppSelector(selectStatisticsLoading);

  const categoria = categorie.find((item) => String(item.id) === String(id));

  useEffect(() => {
    dispatch(getCategorie());
    dispatch(getTags());
  }, [dispatch]);

  useEffect(() => {
    const selected = new Date(year, month - 1, 1);

    dispatch(
      getMonthlyDetailsStatistics({
        year,
        month,
        categoria_id: id,
        tag_id: tagId,
      }),
    );

    dispatch(
      getCategoryTrendChart({
        categoria_id: id,
        data_inizio: toIsoDate(
          startOfMonth(addMonths(selected, -(TREND_MONTHS - 1))),
        ),
        data_fine: toIsoDate(new Date(year, month, 0)),
      }),
    );
  }, [dispatch, id, year, month, tagId]);

  useEffect(() => {
    let alive = true;

    dispatch(
      getTransactionsByCategory({
        categoria_id: id,
        tag_id: tagId,
        data_inizio: toIsoDate(new Date(year, month - 1, 1)),
        data_fine: toIsoDate(new Date(year, month, 0)),
      }),
    )
      .unwrap()
      // Gli importi arrivano come stringhe: la stessa conversione che fa lo
      // slice, perché qui la lista vive nella pagina e non ci passa.
      .then((rows) => alive && setTransactions((rows ?? []).map(mapTransaction)))
      .catch(() => alive && setTransactions([]));

    return () => {
      alive = false;
    };
  }, [dispatch, id, year, month, tagId]);

  // `monthDetails` filtrato su una categoria torna quella sola riga, con le
  // sue sottocategorie.
  const detail = monthlyData[0];
  const monthTotal = Math.abs(detail?.totale ?? 0);

  const subcategories = useMemo(
    () =>
      (detail?.sottocategorie ?? [])
        .map((sub) => ({
          nome: sub.sottocategoria,
          totale: Math.abs(sub.totale),
        }))
        .filter((sub) => sub.totale > 0)
        .sort((a, b) => b.totale - a.totale),
    [detail],
  );

  const series = trendData.map((entry) => Math.abs(Number(entry.spesa)));
  const average =
    series.length > 0
      ? series.reduce((sum, value) => sum + value, 0) / series.length
      : 0;

  const spark = buildTrend(series, SPARK_BOX);

  const monthName = (value: number) =>
    new Intl.DateTimeFormat(localeTag(), { month: "short" }).format(
      new Date(year, value - 1, 1),
    );

  const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat(localeTag(), {
      day: "numeric",
      month: "short",
    }).format(new Date(`${iso.slice(0, 10)}T00:00:00`));

  // Le etichette sotto lo sparkline sono i mesi della finestra, in ordine.
  const trendMonths = Array.from({ length: series.length }, (_, index) => {
    const shifted = addMonths(
      new Date(year, month - 1, 1),
      -(series.length - 1 - index),
    );
    return shifted;
  });

  return (
    <>
      <Page className="category-detail">
        <PageHeader className="category-detail__header">
          <div className="category-detail__top">
            <button
              type="button"
              className="category-detail__back"
              aria-label={t("back")}
              onClick={() => navigate(-1)}
            >
              <i className="pi pi-arrow-left" aria-hidden="true" />
            </button>

            <h1 className="category-detail__title">
              {categoria?.nome ?? t("category")}
            </h1>

            <button
              type="button"
              className="category-detail__period"
              onClick={() => setPeriodOpen(true)}
            >
              {`${monthName(month)} ${year}`}
              <i className="pi pi-chevron-down" aria-hidden="true" />
            </button>
          </div>
        </PageHeader>

        <PageContent>
          <Card className="category-detail__summary">
            <div className="category-detail__figures">
              <div className="category-detail__current">
                <span className="category-detail__eyebrow">
                  {new Intl.DateTimeFormat(localeTag(), {
                    month: "long",
                  }).format(new Date(year, month - 1, 1))}
                </span>
                <Amount
                  className="category-detail__value"
                  value={monthTotal}
                />
              </div>

              <div className="category-detail__average">
                <span className="category-detail__average-label">
                  {`${t("category_detail_average")} ${series.length} ${t("home_months")}`}
                </span>
                <Amount value={average} />
              </div>
            </div>

            {spark && series.length > 1 && (
              <>
                <svg
                  className="spark"
                  viewBox={`0 0 ${SPARK_BOX.width} 120`}
                  role="img"
                  aria-label={t("category_detail_trend")}
                >
                  <polyline className="spark__line" points={spark.line} />

                  <line
                    className="spark__average"
                    x1={SPARK_BOX.padX}
                    y1={spark.scaleY(average)}
                    x2={SPARK_BOX.width - SPARK_BOX.padX}
                    y2={spark.scaleY(average)}
                  />

                  <circle
                    className="spark__dot"
                    cx={spark.points[spark.points.length - 1].x}
                    cy={spark.points[spark.points.length - 1].y}
                    r={5}
                  />
                </svg>

                <div className="spark__labels">
                  {trendMonths.map((date) => (
                    <span key={date.toISOString()}>
                      {new Intl.DateTimeFormat(localeTag(), {
                        month: "short",
                      }).format(date)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Card>

          {subcategories.length > 0 && (
            <Card>
              <CardTitle>{t("sub_categories")}</CardTitle>

              <div className="sub-bars">
                {subcategories.map((sub, index) => (
                  <div className="sub-bars__row" key={sub.nome}>
                    <div className="sub-bars__line">
                      <span className="sub-bars__name">{sub.nome}</span>
                      <Amount className="sub-bars__value" value={sub.totale} />
                    </div>

                    <span className="sub-bars__track">
                      <span
                        className={`sub-bars__fill sub-bars__fill--${(index % 5) + 1}`}
                        style={{
                          width: `${monthTotal > 0 ? (sub.totale / monthTotal) * 100 : 0}%`,
                        }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <section className="category-detail__movements">
            <SectionHeader>
              {`${t("category_detail_movements")} · ${transactions.length}`}
            </SectionHeader>

            {loading && transactions.length === 0 ? (
              <Card>
                <SkeletonList />
              </Card>
            ) : transactions.length === 0 ? (
              <EmptyState
                variant="search"
                icon="pi pi-list"
                title={t("mov_empty_filtered_title")}
                description={t("category_detail_empty")}
              />
            ) : (
              <Card className="category-detail__card">
                <List>
                  {transactions.map((transaction) => (
                    <ListRow
                      key={transaction.id}
                      icon={transactionIcon(
                        transaction.tipo,
                        categoria?.nome,
                      )}
                      title={
                        transaction.descrizione ||
                        categoria?.nome ||
                        t("transaction")
                      }
                      meta={dayLabel(transaction.data)}
                      onClick={() =>
                        dispatch(
                          openSheet({
                            name: "newTransaction",
                            transactionId: transaction.id,
                          }),
                        )
                      }
                      trailing={
                        <Amount
                          value={displayAmount(transaction)}
                          sign="always"
                          hideCurrency
                        />
                      }
                    />
                  ))}
                </List>
              </Card>
            )}
          </section>
        </PageContent>
      </Page>

      <PeriodSheet
        open={periodOpen}
        onClose={() => setPeriodOpen(false)}
        year={year}
        month={month}
        tagId={tagId}
        onChange={(patch) => {
          const next = new URLSearchParams(searchParams);

          if (patch.year !== undefined) next.set("anno", String(patch.year));
          if (patch.month !== undefined) next.set("mese", String(patch.month));
          if (patch.tag !== undefined) {
            if (patch.tag === null) next.delete("tag");
            else next.set("tag", patch.tag);
          }

          setSearchParams(next, { replace: true });
        }}
      />
    </>
  );
}
