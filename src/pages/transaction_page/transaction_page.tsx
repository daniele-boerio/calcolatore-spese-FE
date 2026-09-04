import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useI18n } from "../../i18n/use-i18n";
import { getLocale } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { Page, PageContent, PageHeader } from "../../components/page/page";
import { Card } from "../../components/card/card";
import ListRow, { List } from "../../components/list_row/list_row";
import SectionHeader from "../../components/section_header/section_header";
import Amount from "../../components/amount/amount";
import Chip from "../../components/chip/chip";
import Button from "../../components/button/button";
import EmptyState from "../../components/empty_state/empty_state";
import SkeletonList from "../../components/skeleton/skeleton";
import { getTransactionsPaginated } from "../../features/transactions/api_calls";
import {
  applyFilters,
  resetFilters,
  selectTransactionFilters,
  selectTransactionLoading,
  selectTransactionPagination,
  selectTransactionPeriod,
  selectTransactionTransactions,
  setPeriod,
  updateFilters,
} from "../../features/transactions/transaction_slice";
import {
  DEFAULT_PERIOD,
  decodeFilters,
  encodeFilters,
} from "../../features/transactions/filters_url";
import { PERIOD_LABEL_KEYS } from "../../features/transactions/period";
import {
  amountSign,
  dayOffset,
  displayAmount,
  groupByDay,
} from "../../features/transactions/group";
import { transactionIcon } from "../../features/transactions/icons";
import { Transaction } from "../../features/transactions/interfaces";
import { getConti } from "../../features/conti/api_calls";
import { selectContiConti } from "../../features/conti/conto_slice";
import { getCategorie } from "../../features/categorie/api_calls";
import {
  selectCategoriaCategorie,
  selectCategoriaSottocategorie,
} from "../../features/categorie/categoria_slice";
import { getTags } from "../../features/tags/api_calls";
import { selectTagTags } from "../../features/tags/tag_slice";
import { openSheet } from "../../features/ui/ui_slice";
import { useDebouncedValue } from "../../features/ui/use_debounced_value";
import "./transaction_page.scss";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE = 300;

const localeTag = () => (getLocale() === "it" ? "it-IT" : "en-GB");

/** "2 SETTEMBRE", con "OGGI ·" o "IERI ·" davanti quando serve. */
const groupLabel = (day: string, t: (key: string) => string) => {
  const written = new Intl.DateTimeFormat(localeTag(), {
    day: "numeric",
    month: "long",
  }).format(new Date(`${day}T00:00:00`));

  const offset = dayOffset(day);
  const prefix =
    offset === 0 ? t("mov_today") : offset === 1 ? t("mov_yesterday") : null;

  return (prefix ? `${prefix} · ${written}` : written).toUpperCase();
};

/** Nomi indicizzati per id: le righe risolvono la tassonomia senza cercarla. */
const nameById = <T extends { id: string; nome: string }>(
  list: T[],
): Map<string, string> =>
  new Map(list.map((item) => [String(item.id), item.nome]));

export default function TransactionPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useAppSelector(selectTransactionFilters);
  const period = useAppSelector(selectTransactionPeriod);
  const transactions = useAppSelector(selectTransactionTransactions);
  const loading = useAppSelector(selectTransactionLoading);
  const pagination = useAppSelector(selectTransactionPagination);
  const conti = useAppSelector(selectContiConti);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const sottocategorie = useAppSelector(selectCategoriaSottocategorie);
  const tags = useAppSelector(selectTagTags);

  // La vista è quella che l'indirizzo descrive: è l'URL, non lo store, a dire
  // quali filtri valgono e quando ricaricare. Un refresh o un link condiviso
  // riaprono così la stessa lista invece del mese corrente.
  const search = searchParams.toString();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const settledQuery = useDebouncedValue(query, SEARCH_DEBOUNCE);

  useEffect(() => {
    dispatch(applyFilters(decodeFilters(new URLSearchParams(search))));
    // I dispatch di Redux sono sincroni: il thunk legge i filtri appena
    // applicati, non quelli di prima.
    dispatch(getTransactionsPaginated({ page: 1, size: PAGE_SIZE }));
  }, [dispatch, search]);

  // Filtri → indirizzo. Chiude il cerchio: l'effetto qui sopra riparte solo
  // quando la query string cambia davvero, quindi un tocco che non sposta
  // niente non ricarica niente.
  useEffect(() => {
    const next = encodeFilters(filters, period).toString();
    if (next !== search) setSearchParams(next, { replace: true });
  }, [filters, period, search, setSearchParams]);

  useEffect(() => {
    dispatch(updateFilters({ descrizione: settledQuery || undefined }));
  }, [dispatch, settledQuery]);

  useEffect(() => {
    dispatch(getConti());
    dispatch(getCategorie());
    dispatch(getTags());
  }, [dispatch]);

  const groups = useMemo(() => groupByDay(transactions), [transactions]);

  const categoriaById = useMemo(() => nameById(categorie), [categorie]);
  const sottocategoriaById = useMemo(
    () => nameById(sottocategorie),
    [sottocategorie],
  );
  const tagById = useMemo(() => nameById(tags), [tags]);
  const contoById = useMemo(() => nameById(conti), [conti]);

  const incomes = pagination.total_incomes ?? 0;
  const expenses = pagination.total_expenses ?? 0;
  const compensations = pagination.total_compensation ?? 0;
  const balance = incomes + compensations - expenses;

  const total = pagination.total ?? 0;
  const hasMore = transactions.length < total;

  // Una query vuota descrive la vista di partenza: se produce qualcosa,
  // qualche filtro è acceso.
  const filtered = encodeFilters(filters, period).toString() !== "";

  const openFilters = () => dispatch(openSheet({ name: "filters" }));

  const typeLabel = filters.tipo
    ? ({
        USCITA: t("expenses"),
        ENTRATA: t("income"),
        RICARICA: t("tx_type_transfer"),
      }[filters.tipo] ?? filters.tipo)
    : null;

  /**
   * I filtri accesi, uno per pillola. Quelli spenti non hanno una pillola:
   * una riga di chip che aprono tutti lo stesso foglio non dice niente, mentre
   * una pillola presente dice "questo sta nascondendo qualcosa" e il tocco la
   * toglie.
   */
  const activeChips: { key: string; label: string; clear: () => void }[] = [];

  if (period !== DEFAULT_PERIOD) {
    activeChips.push({
      key: "period",
      label: t(PERIOD_LABEL_KEYS[period]),
      clear: () => dispatch(setPeriod(DEFAULT_PERIOD)),
    });
  }

  if (typeLabel) {
    activeChips.push({
      key: "type",
      label: typeLabel,
      clear: () => dispatch(updateFilters({ tipo: undefined })),
    });
  }

  const listChip = (
    key: "conto_id" | "categoria_id" | "tag_id",
    names: Map<string, string>,
    fallback: string,
  ) => {
    const ids = filters[key];
    if (!ids?.length) return;

    activeChips.push({
      key,
      label:
        ids.length === 1 ? (names.get(ids[0]) ?? fallback) : `${ids.length} ${fallback}`,
      clear: () => dispatch(updateFilters({ [key]: undefined })),
    });
  };

  listChip("conto_id", contoById, t("nav_accounts").toLowerCase());
  listChip("categoria_id", categoriaById, t("nav_categories").toLowerCase());
  listChip("tag_id", tagById, t("nav_tags").toLowerCase());

  if (filters.importo_min !== undefined || filters.importo_max !== undefined) {
    activeChips.push({
      key: "amount",
      label: t("amount"),
      clear: () =>
        dispatch(
          updateFilters({ importo_min: undefined, importo_max: undefined }),
        ),
    });
  }

  if (filters.senza_categoria) {
    activeChips.push({
      key: "uncategorized",
      label: t("mov_only_uncategorized"),
      clear: () => dispatch(updateFilters({ senza_categoria: undefined })),
    });
  }

  return (
    <Page className="movements">
      <PageHeader className="movements__header">
        <div className="movements__top">
          <h1 className="page-title">{t("nav_movements")}</h1>

          {/* Ricorrenze e debiti sono movimenti che si ripetono o che devi
              ancora fare: stanno qui, non in un menu da un'altra parte. */}
          <div className="movements__actions">
            <button
              type="button"
              className="movements__icon-button"
              aria-label={t("nav_recurrings")}
              title={t("nav_recurrings")}
              onClick={() => navigate("/recurrings")}
            >
              <i className="pi pi-refresh" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="movements__icon-button"
              aria-label={t("nav_debts")}
              title={t("nav_debts")}
              onClick={() => navigate("/debts")}
            >
              <i className="pi pi-receipt" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="movements__icon-button"
              aria-label={t("filters")}
              onClick={openFilters}
            >
              <i className="pi pi-sliders-h" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="movements__search">
          <i className="pi pi-search" aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder={t("search_by_description")}
            aria-label={t("search_by_description")}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {activeChips.length > 0 && (
          <div className="movements__chips">
            {activeChips.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                icon="pi pi-times"
                variant="active"
                onClick={chip.clear}
              />
            ))}
          </div>
        )}

        <div className="movements__summary">
          <div className="movements__balance">
            <span className="movements__eyebrow">{t("mov_balance")}</span>
            <Amount
              className="movements__balance-value"
              value={balance}
              sign="always"
              tone={balance >= 0 ? "positive" : "negative"}
            />
          </div>

          <div className="movements__totals">
            <div className="movements__total">
              <span className="movements__total-label">{t("income")}</span>
              <Amount value={incomes} decimals={0} hideCurrency />
            </div>
            <div className="movements__total">
              <span className="movements__total-label">{t("expenses")}</span>
              <Amount value={expenses} decimals={0} hideCurrency />
            </div>
          </div>
        </div>
      </PageHeader>

      <PageContent className="movements__list">
        {loading && transactions.length === 0 ? (
          <Card>
            <SkeletonList />
          </Card>
        ) : groups.length === 0 ? (
          filtered ? (
            <EmptyState
              variant="search"
              icon="pi pi-search"
              title={t("mov_empty_filtered_title")}
              description={t("mov_empty_filtered_text")}
              actions={
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    dispatch(resetFilters());
                  }}
                >
                  {t("mov_clear_filters")}
                </Button>
              }
            />
          ) : (
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
          )
        ) : (
          <>
            {groups.map((group) => (
              <section className="movements__group" key={group.day}>
                <SectionHeader
                  aside={
                    <Amount
                      value={group.total}
                      sign="always"
                      tone={group.total >= 0 ? "positive" : "neutral"}
                    />
                  }
                >
                  {groupLabel(group.day, t)}
                </SectionHeader>

                <Card className="movements__card">
                  <List>
                    {group.transactions.map((transaction) => (
                      <Row
                        key={transaction.id}
                        transaction={transaction}
                        categoria={categoriaById.get(
                          String(transaction.categoria_id),
                        )}
                        sottocategoria={sottocategoriaById.get(
                          String(transaction.sottocategoria_id),
                        )}
                        tag={tagById.get(String(transaction.tag_id))}
                        conto={contoById.get(String(transaction.conto_id))}
                        contoDestinazione={contoById.get(
                          String(transaction.conto_destinazione_id),
                        )}
                        onOpen={() =>
                          dispatch(
                            openSheet({
                              name: "transactionDetail",
                              transactionId: transaction.id,
                            }),
                          )
                        }
                      />
                    ))}
                  </List>
                </Card>
              </section>
            ))}

            {hasMore && (
              <Button
                variant="neutral"
                block
                disabled={loading}
                onClick={() =>
                  dispatch(
                    getTransactionsPaginated({
                      page: (pagination.page ?? 1) + 1,
                      size: PAGE_SIZE,
                      append: true,
                    }),
                  )
                }
              >
                {t("mov_load_more")}
              </Button>
            )}
          </>
        )}
      </PageContent>
    </Page>
  );
}

type RowProps = {
  transaction: Transaction;
  categoria?: string;
  sottocategoria?: string;
  tag?: string;
  conto?: string;
  contoDestinazione?: string;
  onOpen: () => void;
};

function Row({
  transaction,
  categoria,
  sottocategoria,
  tag,
  conto,
  contoDestinazione,
  onOpen,
}: RowProps) {
  const { t } = useI18n();

  const isIncome =
    transaction.tipo === "ENTRATA" || transaction.tipo === "RIMBORSO";

  // Un giroconto si racconta con i due conti, tutto il resto con la sua
  // tassonomia: la categoria di un trasferimento interno non dice niente.
  const meta =
    transaction.conto_destinazione_id && contoDestinazione
      ? `${conto ?? "—"} → ${contoDestinazione}`
      : [categoria, sottocategoria, tag && `#${tag}`].filter(Boolean).join(" · ");

  return (
    <ListRow
      icon={transactionIcon(transaction.tipo, categoria)}
      iconTone={isIncome ? "accent" : "neutral"}
      title={transaction.descrizione || categoria || t("transaction")}
      meta={meta}
      onClick={onOpen}
      trailing={
        <Amount
          value={displayAmount(transaction)}
          sign={amountSign(transaction.tipo)}
          tone={isIncome ? "positive" : "neutral"}
          hideCurrency
        />
      }
    />
  );
}
