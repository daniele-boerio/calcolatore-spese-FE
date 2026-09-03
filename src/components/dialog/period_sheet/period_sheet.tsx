import Sheet from "../../sheet/sheet";
import Chip from "../../chip/chip";
import { useI18n } from "../../../i18n/use-i18n";
import { getLocale } from "../../../i18n";
import { useAppSelector } from "../../../store/store";
import { selectTagTags } from "../../../features/tags/tag_slice";
import "./period_sheet.scss";

// Quanto indietro si può andare: oltre non c'è storia da guardare.
const YEARS_BACK = 5;

type PeriodSheetProps = {
  open: boolean;
  onClose: () => void;
  year: number;
  /** Assente quando il periodo è un anno intero (viste Anno e Categorie). */
  month?: number;
  tagId: string | null;
  onChange: (patch: { year?: number; month?: number; tag?: string | null }) => void;
};

/**
 * Il periodo dell'Analisi: anno, mese e — dove serve — il tag su cui filtrare.
 * Sta in un foglio invece che in tre dropdown perché l'intestazione della
 * schermata ha spazio per una pillola sola.
 */
export default function PeriodSheet({
  open,
  onClose,
  year,
  month,
  tagId,
  onChange,
}: PeriodSheetProps) {
  const { t } = useI18n();
  const tags = useAppSelector(selectTagTags);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: YEARS_BACK + 1 },
    (_, index) => currentYear - index,
  );

  const monthName = (value: number) =>
    new Intl.DateTimeFormat(getLocale() === "it" ? "it-IT" : "en-GB", {
      month: "short",
    }).format(new Date(year, value - 1, 1));

  return (
    <Sheet open={open} onClose={onClose} title={t("analysis_period")}>
      <section className="period-sheet__section">
        <span className="period-sheet__label">{t("year")}</span>
        <div className="period-sheet__chips">
          {years.map((value) => (
            <Chip
              key={value}
              label={String(value)}
              variant={value === year ? "accent" : "solid"}
              onClick={() => onChange({ year: value })}
            />
          ))}
        </div>
      </section>

      {month !== undefined && (
        <section className="period-sheet__section">
          <span className="period-sheet__label">{t("month")}</span>
          <div className="period-sheet__months">
            {Array.from({ length: 12 }, (_, index) => index + 1).map(
              (value) => (
                <Chip
                  key={value}
                  className="period-sheet__month"
                  label={monthName(value)}
                  variant={value === month ? "accent" : "solid"}
                  onClick={() => onChange({ month: value })}
                />
              ),
            )}
          </div>
        </section>
      )}

      {tags.length > 0 && (
        <section className="period-sheet__section">
          <span className="period-sheet__label">{t("tag")}</span>
          <div className="period-sheet__chips">
            <Chip
              label={t("mov_type_all")}
              variant={tagId ? "solid" : "accent"}
              onClick={() => onChange({ tag: null })}
            />

            {tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.nome}
                variant={String(tag.id) === String(tagId) ? "accent" : "solid"}
                onClick={() => onChange({ tag: tag.id })}
              />
            ))}
          </div>
        </section>
      )}
    </Sheet>
  );
}
