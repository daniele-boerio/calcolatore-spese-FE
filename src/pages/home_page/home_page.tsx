import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/use-i18n";
import { getLocale } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { Page, PageContent, PageHeader } from "../../components/page/page";
import { Card, CardTitle } from "../../components/card/card";
import ListRow, { List } from "../../components/list_row/list_row";
import Amount from "../../components/amount/amount";
import ProgressBar from "../../components/progress_bar/progress_bar";
import StatTrio from "../../components/stat_trio/stat_trio";
import EmptyState from "../../components/empty_state/empty_state";
import SkeletonList from "../../components/skeleton/skeleton";
import Button from "../../components/button/button";
import {
  getConti,
  getCurrentMonthExpenses,
  getCurrentMonthExpensesByCategory,
} from "../../features/conti/api_calls";
import {
  selectContiConti,
  selectContiMonthIncome,
  selectContiMonthlyBudget,
  selectContiMonthlyExpensesByCategory,
  selectContiMonthlySpending,
} from "../../features/conti/conto_slice";
import { getCategorie } from "../../features/categorie/api_calls";
import { getTags } from "../../features/tags/api_calls";
import { getLastTransactions } from "../../features/transactions/api_calls";
import {
  selectTransactionLoading,
  selectTransactionTransactions,
} from "../../features/transactions/transaction_slice";
import { categoryIcon } from "../../features/categorie/icons";
import { transactionIcon } from "../../features/transactions/icons";
import { selectCategoriaCategorie } from "../../features/categorie/categoria_slice";
import {
  getCategoryAverages,
  getPreviousMonthExpenses,
  getUpcomingRecurrences,
  getWeekSpending,
} from "../../features/home/api_calls";
import {
  selectHomeCategoryAverages,
  selectHomePreviousMonthExpenses,
  selectHomeUpcoming,
  selectHomeUpcomingDays,
  selectHomeWeekSpending,
} from "../../features/home/home_slice";
import { percentDelta } from "../../features/home/derive";
import { openSheet } from "../../features/ui/ui_slice";
import { selectProfileUsername } from "../../features/profile/profile_slice";
import "./home_page.scss";

// Orizzonte della card "In arrivo" e mesi mediati per il "sopra media":
// entrambi vengono dal design.
const UPCOMING_DAYS = 10;
const AVERAGE_MONTHS = 3;
// Sotto questo scarto "sopra media" è rumore, non un segnale.
const ABOVE_AVERAGE_RATIO = 1.1;
const TOP_CATEGORIES = 4;
const LATEST_TRANSACTIONS = 3;
const WEEK_LENGTH = 7;

const localeTag = () => (getLocale() === "it" ? "it-IT" : "en-GB");

const monthName = (date: Date) =>
  new Intl.DateTimeFormat(localeTag(), { month: "long" }).format(date);

const formatDay = (iso: string) =>
  new Intl.DateTimeFormat(localeTag(), {
    day: "numeric",
    month: "short",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00`));

const initialsOf = (username: string | null) =>
  (username ?? "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export default function HomePage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const spending = useAppSelector(selectContiMonthlySpending);
  const budget = useAppSelector(selectContiMonthlyBudget);
  const income = useAppSelector(selectContiMonthIncome);
  const conti = useAppSelector(selectContiConti);
  const byCategory = useAppSelector(selectContiMonthlyExpensesByCategory);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const transactions = useAppSelector(selectTransactionTransactions);
  const transactionsLoading = useAppSelector(selectTransactionLoading);

  const weekSpending = useAppSelector(selectHomeWeekSpending);
  const upcoming = useAppSelector(selectHomeUpcoming);
  const upcomingDays = useAppSelector(selectHomeUpcomingDays);
  const previousMonthExpenses = useAppSelector(selectHomePreviousMonthExpenses);
  const categoryAverages = useAppSelector(selectHomeCategoryAverages);
  const username = useAppSelector(selectProfileUsername);

  useEffect(() => {
    dispatch(getCurrentMonthExpenses());
    dispatch(getCurrentMonthExpensesByCategory());
    dispatch(getConti());
    dispatch(getCategorie());
    dispatch(getTags());
    dispatch(getLastTransactions({ n: LATEST_TRANSACTIONS }));

    // Dati che il BE non espone come tali: li ricompone lo slice `home`.
    dispatch(getWeekSpending());
    dispatch(getUpcomingRecurrences({ days: UPCOMING_DAYS }));
    dispatch(getPreviousMonthExpenses());
    dispatch(getCategoryAverages({ months: AVERAGE_MONTHS }));
  }, [dispatch]);

  const today = useMemo(() => new Date(), []);
  const previousMonth = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() - 1, 1),
    [today],
  );

  const netWorth = useMemo(
    () => conti.reduce((sum, conto) => sum + Number(conto.saldo), 0),
    [conti],
  );

  const topCategories = useMemo(
    () =>
      [...byCategory].sort((a, b) => b.value - a.value).slice(0, TOP_CATEGORIES),
    [byCategory],
  );

  const categoriaById = useMemo(
    () => new Map(categorie.map((c) => [String(c.id), c.nome])),
    [categorie],
  );

  const contoById = useMemo(
    () => new Map(conti.map((c) => [String(c.id), c.nome])),
    [conti],
  );

  const delta = percentDelta(spending.spent, previousMonthExpenses);
  const upcomingTotal = upcoming.reduce((sum, item) => sum + item.importo, 0);

  return (
    <Page className="home-page">
      <PageHeader className="home-page__header">
        <div className="home-page__salute">
          <span className="home-page__greeting">
            {t("home_greeting")} {username}
          </span>
          <span className="home-page__month">
            {monthName(today)} {today.getFullYear()}
          </span>
        </div>

        <span className="home-page__avatar" aria-hidden="true">
          {initialsOf(username)}
        </span>
      </PageHeader>

      <PageContent>
        <HeroCard
          spent={spending.spent}
          budget={spending.budget}
          projected={spending.projected}
          remaining={spending.remaining}
          percentage={spending.percentage}
          delta={delta}
          eyebrow={`${t("home_expenses_of")} ${monthName(today)}`}
          deltaLabel={`${t("home_vs")} ${monthName(previousMonth)}`}
        />

        <StatTrio
          stats={[
            {
              label: t("home_income"),
              value: <Amount value={income} decimals={0} hideCurrency />,
            },
            {
              label: t("home_savings"),
              value: (
                <Amount value={budget.remaining ?? 0} decimals={0} hideCurrency />
              ),
              tone: (budget.remaining ?? 0) >= 0 ? "positive" : "negative",
            },
            {
              label: t("home_net_worth"),
              value: <Amount value={netWorth} decimals={0} hideCurrency />,
            },
          ]}
        />

        <WeekCard spending={weekSpending} />

        <Card>
          <CardTitle
            aside={
              <Link className="home-page__link" to="/analysis">
                {t("home_detail")}
              </Link>
            }
          >
            {t("home_where_money_goes")}
          </CardTitle>

          {topCategories.length === 0 ? (
            <p className="home-page__muted">{t("home_no_categories")}</p>
          ) : (
            <div className="category-list">
              {topCategories.map((category, index) => {
                const average = categoryAverages[category.label] ?? 0;
                const aboveAverage =
                  average > 0 && category.value > average * ABOVE_AVERAGE_RATIO;
                const largest = topCategories[0].value;
                const share = largest > 0 ? category.value / largest : 0;

                return (
                  <div className="category-list__row" key={category.label}>
                    <span
                      className={`category-list__icon${
                        aboveAverage ? " category-list__icon--over" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <i className={categoryIcon(category.label)} />
                    </span>

                    <div className="category-list__body">
                      <div className="category-list__line">
                        <span className="category-list__name">
                          {category.label}
                          {aboveAverage && (
                            <span className="category-list__over">
                              {` · ${t("home_above_average")}`}
                            </span>
                          )}
                        </span>
                        <Amount value={category.value} />
                      </div>

                      <ProgressBar
                        label={category.label}
                        height={6}
                        className={`category-list__bar category-list__bar--${index + 1}`}
                        segments={[
                          {
                            value: share,
                            tone: aboveAverage ? "negative" : "accent",
                          },
                        ]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {upcoming.length > 0 && (
          <Card variant="invert">
            <CardTitle
              aside={
                <>
                  <Amount value={upcomingTotal} decimals={0} />
                  {` ${t("home_upcoming_within")} ${upcomingDays} ${t("home_days")}`}
                </>
              }
            >
              {t("home_upcoming")}
            </CardTitle>

            <List>
              {upcoming.map((item) => (
                <ListRow
                  key={item.id}
                  icon="pi pi-refresh"
                  iconShape="square"
                  iconTone="invert"
                  title={item.nome}
                  meta={[
                    formatDay(item.prossima_esecuzione),
                    contoById.get(item.conto_id),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  trailing={<Amount value={item.importo} />}
                />
              ))}
            </List>
          </Card>
        )}

        <Card>
          <CardTitle
            aside={
              <Link className="home-page__link" to="/transactions">
                {t("home_see_all")}
              </Link>
            }
          >
            {t("home_latest")}
          </CardTitle>

          {transactionsLoading && transactions.length === 0 ? (
            <SkeletonList />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon="pi pi-list"
              title={t("home_empty_title")}
              description={t("home_empty_text")}
              actions={
                <Button
                  size="sm"
                  onClick={() => dispatch(openSheet({ name: "newTransaction" }))}
                >
                  {t("home_empty_action")}
                </Button>
              }
            />
          ) : (
            <List>
              {transactions.slice(0, LATEST_TRANSACTIONS).map((transaction) => {
                const isIncome = transaction.tipo === "ENTRATA";
                const categoryName = categoriaById.get(
                  String(transaction.categoria_id),
                );

                return (
                  <ListRow
                    key={transaction.id}
                    icon={transactionIcon(transaction.tipo, categoryName)}
                    iconTone={isIncome ? "accent" : "neutral"}
                    title={transaction.descrizione || categoryName || "—"}
                    meta={[formatDay(transaction.data), categoryName]
                      .filter(Boolean)
                      .join(" · ")}
                    trailing={
                      <Amount
                        value={transaction.importo}
                        sign={isIncome ? "never" : "auto"}
                        tone={isIncome ? "positive" : "neutral"}
                      />
                    }
                  />
                );
              })}
            </List>
          )}
        </Card>
      </PageContent>
    </Page>
  );
}

type HeroCardProps = {
  spent: number;
  budget: number | null;
  projected: number;
  remaining: number | null;
  percentage: number | null;
  delta: number | null;
  eyebrow: string;
  deltaLabel: string;
};

function HeroCard({
  spent,
  budget,
  projected,
  remaining,
  percentage,
  delta,
  eyebrow,
  deltaLabel,
}: HeroCardProps) {
  const { t } = useI18n();

  // Speso e previsto sono due segmenti della stessa barra: il secondo prende
  // solo quello che avanza, altrimenti a budget sforato la barra deborda.
  const spentRatio = budget ? Math.min(1, spent / budget) : 0;
  const projectedRatio = budget
    ? Math.min(1 - spentRatio, projected / budget)
    : 0;

  const overBudget = remaining !== null && remaining < 0;

  return (
    <Card className="hero">
      <div className="hero__top">
        <span className="hero__eyebrow">{eyebrow}</span>

        {delta !== null && (
          <span
            className={`hero__delta hero__delta--${delta <= 0 ? "good" : "bad"}`}
          >
            <i
              className={`pi ${delta <= 0 ? "pi-arrow-down-right" : "pi-arrow-up-right"}`}
              aria-hidden="true"
            />
            {`${Math.abs(delta)}% ${deltaLabel}`}
          </span>
        )}
      </div>

      <Amount className="hero__number" value={spent} decimals={0} />

      {budget !== null ? (
        <div className="hero__budget">
          <ProgressBar
            height={10}
            label={t("home_of_budget")}
            segments={[
              { value: spentRatio, tone: "accent" },
              { value: projectedRatio, tone: "accent-2" },
            ]}
          />

          <div className="hero__legend">
            <span>
              {percentage !== null ? `${Math.round(percentage)}% ` : ""}
              {`${t("home_of_budget")} `}
              <strong>
                <Amount value={budget} decimals={0} />
              </strong>
            </span>
            <span>
              {`${overBudget ? t("home_over_budget") : t("home_remaining")} `}
              <strong className={overBudget ? "hero__over" : undefined}>
                <Amount value={Math.abs(remaining ?? 0)} decimals={0} />
              </strong>
            </span>
          </div>
        </div>
      ) : (
        <Link className="hero__set-budget" to="/settings">
          {t("home_set_budget")}
          <i className="pi pi-chevron-right" aria-hidden="true" />
        </Link>
      )}
    </Card>
  );
}

function WeekCard({ spending }: { spending: number[] }) {
  const { t } = useI18n();

  // getDay(): 0 = domenica. La settimana del design parte di lunedì.
  const todayIndex = (new Date().getDay() + 6) % WEEK_LENGTH;

  const max = Math.max(...spending, 0);
  const total = spending.reduce((sum, value) => sum + value, 0);
  // La media è sui giorni già trascorsi: dividere sempre per sette la farebbe
  // sembrare bassa a metà settimana.
  const average = total / (todayIndex + 1);

  const labels = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - todayIndex);

    return Array.from({ length: WEEK_LENGTH }, (_, index) => {
      const day = new Date(start);
      day.setDate(day.getDate() + index);
      return new Intl.DateTimeFormat(localeTag(), { weekday: "narrow" }).format(
        day,
      );
    });
  }, [todayIndex]);

  return (
    <Card>
      <CardTitle
        aside={
          <>
            {`${t("home_average")} `}
            <strong>
              <Amount value={average} decimals={0} />
            </strong>
            {t("home_per_day")}
          </>
        }
      >
        {t("home_this_week")}
      </CardTitle>

      <div className="week-chart">
        {spending.map((value, index) => {
          const isFuture = index > todayIndex;
          const isMax = max > 0 && value === max;
          const height = max > 0 ? Math.round((value / max) * 100) : 0;

          const variant = isFuture ? "future" : isMax ? "max" : "past";

          return (
            <div className="week-chart__day" key={index}>
              <div
                className={`week-chart__bar week-chart__bar--${variant}`}
                // 8% è la soglia sotto cui una barra non si legge più.
                style={{ height: `${Math.max(height, 8)}%` }}
              />
              <span
                className={`week-chart__label${isMax ? " week-chart__label--max" : ""}`}
              >
                {labels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
