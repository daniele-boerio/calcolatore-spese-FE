import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../../i18n/use-i18n";
import { Page, PageContent, PageHeader } from "../../components/page/page";
import SegmentedControl from "../../components/segmented_control/segmented_control";
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

export default function AnalysisPage() {
  const { t } = useI18n();

  // Nell'URL, così la vista sopravvive al refresh e si può linkare.
  const [searchParams, setSearchParams] = useSearchParams();
  const scopeParam = searchParams.get("scope");
  const scope: Scope = isScope(scopeParam) ? scopeParam : "month";

  const setScope = (next: Scope) =>
    setSearchParams({ scope: next }, { replace: true });

  const renderScope = () => {
    switch (scope) {
      case "month":
        return <MonthStatistics />;
      case "year":
        return <YearStatistics />;
      case "categories":
        return <ChartsPage />;
    }
  };

  return (
    <Page className="analysis-page">
      <PageHeader className="analysis-page__header">
        <h1 className="page-title">{t("nav_analysis")}</h1>

        <SegmentedControl
          value={scope}
          onChange={setScope}
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
  );
}
