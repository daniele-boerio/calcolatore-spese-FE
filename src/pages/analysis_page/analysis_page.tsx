import { lazy, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../../i18n/use-i18n";
import { getLocale } from "../../i18n";
import { useAppDispatch } from "../../store/store";
import { Page, PageContent, PageHeader } from "../../components/page/page";
import SegmentedControl from "../../components/segmented_control/segmented_control";
import PeriodSheet from "../../components/dialog/period_sheet/period_sheet";
import { getTags } from "../../features/tags/api_calls";
import "./analysis_page.scss";

// Statistiche e Grafici erano due voci di menu distinte: ora sono tre viste
// della stessa schermata.
const MonthStatistics = lazy(
  () => import("../statistics_page/month_statistics/month_statistics"),
);
const YearStatistics = lazy(
  () => import("../statistics_page/year_statistics/year_statistics"),
);
const ChartsPage = lazy(() => import("../charts_page/charts_page"));

type Scope = "month" | "year" | "categories";

const SCOPES: Scope[] = ["month", "year", "categories"];

const isScope = (value: string | null): value is Scope =>
  SCOPES.includes(value as Scope);

const localeTag = () => (getLocale() === "it" ? "it-IT" : "en-GB");

export default function AnalysisPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Vista e periodo stanno nell'URL: sopravvivono al refresh e si linkano.
  const [searchParams, setSearchParams] = useSearchParams();
  const [periodOpen, setPeriodOpen] = useState(false);

  const today = new Date();
  const scopeParam = searchParams.get("scope");
  const scope: Scope = isScope(scopeParam) ? scopeParam : "month";
  const year = Number(searchParams.get("anno")) || today.getFullYear();
  const month = Number(searchParams.get("mese")) || today.getMonth() + 1;
  const tagId = searchParams.get("tag");

  // Il selettore di periodo mostra i tag: qui è l'unico posto che li carica.
  useEffect(() => {
    dispatch(getTags());
  }, [dispatch]);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }

    setSearchParams(next, { replace: true });
  };

  const periodLabel =
    scope === "month"
      ? new Intl.DateTimeFormat(localeTag(), {
          month: "long",
          year: "numeric",
        }).format(new Date(year, month - 1, 1))
      : String(year);

  const renderScope = () => {
    switch (scope) {
      case "month":
        return <MonthStatistics year={year} month={month} tagId={tagId} />;
      case "year":
        return <YearStatistics />;
      case "categories":
        return <ChartsPage />;
    }
  };

  return (
    <>
      <Page className="analysis-page">
        <PageHeader className="analysis-page__header">
          <div className="analysis-page__top">
            <h1 className="page-title">{t("nav_analysis")}</h1>

            <button
              type="button"
              className="analysis-page__period"
              onClick={() => setPeriodOpen(true)}
            >
              {periodLabel}
              <i className="pi pi-chevron-down" aria-hidden="true" />
            </button>
          </div>

          <SegmentedControl
            value={scope}
            onChange={(next) => update({ scope: next })}
            ariaLabel={t("nav_analysis")}
            options={[
              { value: "month", label: t("analysis_scope_month") },
              { value: "year", label: t("analysis_scope_year") },
              { value: "categories", label: t("analysis_scope_categories") },
            ]}
          />
        </PageHeader>

        <PageContent>
          <Suspense fallback={null}>{renderScope()}</Suspense>
        </PageContent>
      </Page>

      <PeriodSheet
        open={periodOpen}
        onClose={() => setPeriodOpen(false)}
        year={year}
        month={scope === "month" ? month : undefined}
        tagId={tagId}
        onChange={(patch) =>
          update({
            ...(patch.year !== undefined ? { anno: String(patch.year) } : {}),
            ...(patch.month !== undefined ? { mese: String(patch.month) } : {}),
            ...(patch.tag !== undefined ? { tag: patch.tag } : {}),
          })
        }
      />
    </>
  );
}
