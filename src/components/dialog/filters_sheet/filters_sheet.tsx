import { ReactNode, useEffect, useMemo, useState } from "react";
import Sheet from "../../sheet/sheet";
import Chip from "../../chip/chip";
import Button from "../../button/button";
import Calendar from "../../calendar/calendar";
import SegmentedControl from "../../segmented_control/segmented_control";
import RangeSlider from "../../range_slider/range_slider";
import { useI18n } from "../../../i18n/use-i18n";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useDebouncedValue } from "../../../features/ui/use_debounced_value";
import { formatNumber } from "../../../features/ui/format";
import {
  resetFilters,
  selectTransactionFilters,
  selectTransactionPagination,
  selectTransactionPeriod,
  selectTransactionTransactions,
  setPeriod,
  updateFilters,
} from "../../../features/transactions/transaction_slice";
import {
  PERIOD_LABEL_KEYS,
  PERIOD_PRESETS,
} from "../../../features/transactions/period";
import { amountCeiling } from "../../../features/transactions/group";
import { selectContiConti } from "../../../features/conti/conto_slice";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { selectTagTags } from "../../../features/tags/tag_slice";
import { toIsoDate } from "../../../services/dates";
import "./filters_sheet.scss";

// Il cursore non deve avere un passo più fine di quanto la scala sappia
// mostrare: un centesimo del tetto è già abbastanza preciso.
const STEP_RATIO = 100;
const RANGE_DEBOUNCE = 250;

type FiltersSheetProps = {
  visible: boolean;
  onHide: () => void;
};

type ListKey = "conto_id" | "categoria_id" | "tag_id";

const parseDate = (value?: string): Date | null => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

/**
 * Foglio dei filtri dei Movimenti.
 *
 * Ogni tocco applica subito: la lista dietro si aggiorna mentre il foglio è
 * aperto, e il bottone in fondo non conferma niente — dice quanti movimenti
 * restano e chiude. È l'unico modo perché quel numero sia vero.
 */
export default function FiltersSheet({ visible, onHide }: FiltersSheetProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const filters = useAppSelector(selectTransactionFilters);
  const period = useAppSelector(selectTransactionPeriod);
  const pagination = useAppSelector(selectTransactionPagination);
  const transactions = useAppSelector(selectTransactionTransactions);
  const conti = useAppSelector(selectContiConti);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const tags = useAppSelector(selectTagTags);

  // Il tetto del cursore si deduce dai movimenti a schermo; un massimo già
  // scelto lo alza, altrimenti riaprendo il foglio la maniglia sarebbe fuori
  // scala.
  const ceiling = useMemo(
    () => Math.max(amountCeiling(transactions), filters.importo_max ?? 0),
    [transactions, filters.importo_max],
  );

  const [range, setRange] = useState<[number, number]>([
    filters.importo_min ?? 0,
    filters.importo_max ?? ceiling,
  ]);
  const settledRange = useDebouncedValue(range, RANGE_DEBOUNCE);

  useEffect(() => {
    const [low, high] = settledRange;

    // Agli estremi il filtro sparisce: "da zero a tutto" non è un filtro.
    dispatch(
      updateFilters({
        importo_min: low > 0 ? low : undefined,
        importo_max: high < ceiling ? high : undefined,
      }),
    );
  }, [dispatch, settledRange, ceiling]);

  const selected = (key: ListKey) => filters[key] ?? [];

  const isOn = (key: ListKey, id: string) => selected(key).includes(id);

  const toggleIn = (key: ListKey, id: string) => {
    const current = selected(key);
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];

    dispatch(updateFilters({ [key]: next.length > 0 ? next : undefined }));
  };

  const total = pagination.total ?? 0;

  return (
    <Sheet
      open={visible}
      onClose={onHide}
      title={t("filters")}
      className="filters-sheet"
      action={
        <button
          type="button"
          className="filters-sheet__reset"
          onClick={() => {
            dispatch(resetFilters());
            setRange([0, ceiling]);
          }}
        >
          {t("mov_clear")}
        </button>
      }
      footer={
        <Button block onClick={onHide}>
          {`${t("mov_show")} ${total} ${t("nav_movements").toLowerCase()}`}
        </Button>
      }
    >
      <Section label={t("mov_period")}>
        <div className="filters-sheet__chips">
          {PERIOD_PRESETS.map((preset) => (
            <Chip
              key={preset}
              label={t(PERIOD_LABEL_KEYS[preset])}
              variant={period === preset ? "accent" : "solid"}
              onClick={() => dispatch(setPeriod(preset))}
            />
          ))}

          <Chip
            label={t(PERIOD_LABEL_KEYS.custom)}
            variant={period === "custom" ? "accent" : "dashed"}
            onClick={() => dispatch(setPeriod("custom"))}
          />
        </div>

        {period === "custom" && (
          <div className="filters-sheet__dates">
            <Calendar
              label={t("from_date")}
              value={parseDate(filters.data_inizio)}
              onChange={(event) =>
                dispatch(
                  updateFilters({
                    data_inizio: event.value
                      ? toIsoDate(event.value as Date)
                      : undefined,
                  }),
                )
              }
              showIcon
              showButtonBar
            />
            <Calendar
              label={t("to_date")}
              value={parseDate(filters.data_fine)}
              onChange={(event) =>
                dispatch(
                  updateFilters({
                    data_fine: event.value
                      ? toIsoDate(event.value as Date)
                      : undefined,
                  }),
                )
              }
              showIcon
              showButtonBar
            />
          </div>
        )}
      </Section>

      <Section label={t("mov_type")}>
        <SegmentedControl
          ariaLabel={t("mov_type")}
          value={filters.tipo ?? ""}
          options={[
            { value: "", label: t("mov_type_all") },
            { value: "USCITA", label: t("expenses") },
            { value: "ENTRATA", label: t("income") },
            { value: "RICARICA", label: t("transfer") },
          ]}
          onChange={(value) =>
            dispatch(updateFilters({ tipo: value || undefined }))
          }
        />
      </Section>

      {conti.length > 0 && (
        <Section label={t("nav_accounts")}>
          <div className="filters-sheet__chips">
            {conti.map((conto) => (
              <Chip
                key={conto.id}
                label={conto.nome}
                icon={isOn("conto_id", conto.id) ? "pi pi-check" : undefined}
                variant={isOn("conto_id", conto.id) ? "accent" : "solid"}
                onClick={() => toggleIn("conto_id", conto.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {categorie.length > 0 && (
        <Section label={t("nav_categories")}>
          <div className="filters-sheet__chips">
            {categorie.map((categoria) => (
              <Chip
                key={categoria.id}
                label={categoria.nome}
                icon={
                  isOn("categoria_id", categoria.id) ? "pi pi-check" : undefined
                }
                variant={isOn("categoria_id", categoria.id) ? "accent" : "solid"}
                onClick={() => toggleIn("categoria_id", categoria.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {tags.length > 0 && (
        <Section label={t("nav_tags")}>
          <div className="filters-sheet__chips">
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.nome}
                icon={isOn("tag_id", tag.id) ? "pi pi-check" : undefined}
                variant={isOn("tag_id", tag.id) ? "accent" : "solid"}
                onClick={() => toggleIn("tag_id", tag.id)}
              />
            ))}
          </div>
        </Section>
      )}

      <RangeSlider
        label={t("amount")}
        min={0}
        max={ceiling}
        step={Math.max(1, Math.round(ceiling / STEP_RATIO))}
        value={range}
        onChange={setRange}
        caption={`${formatNumber(range[0], 0)} – ${formatNumber(range[1], 0)}${
          range[1] >= ceiling ? "+" : ""
        } €`}
      />
    </Sheet>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="filters-sheet__section">
      <span className="filters-sheet__label">{label}</span>
      {children}
    </section>
  );
}
