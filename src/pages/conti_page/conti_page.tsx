import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/use-i18n";
import { getLocale } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { Page, PageContent, PageHeader } from "../../components/page/page";
import { Card } from "../../components/card/card";
import ListRow, { List } from "../../components/list_row/list_row";
import Amount from "../../components/amount/amount";
import Alert from "../../components/alert/alert";
import ProgressBar from "../../components/progress_bar/progress_bar";
import EmptyState from "../../components/empty_state/empty_state";
import SkeletonList from "../../components/skeleton/skeleton";
import Button from "../../components/button/button";
import ThreeDotsActionsMenu from "../../components/three_dots_action_menu/three_dots_action_menu";
import AccountDialog from "../../components/dialog/account_dialog/account_dialog";
import BankConnectDialog from "../../components/dialog/bank_connect_dialog/bank_connect_dialog";
import "./conti_page.scss";
import {
  countContoTransactions,
  deleteConto,
  getConti,
  getCurrentMonthExpenses,
} from "../../features/conti/api_calls";
import { Conto } from "../../features/conti/interfaces";
import {
  selectContiConti,
  selectContiLoading,
  selectContiMonthlyBudget,
} from "../../features/conti/conto_slice";
import { selectIsOpenBankingAdmin } from "../../features/profile/profile_slice";
import { getInvestimenti } from "../../features/investimenti/api_calls";
import { selectInvestimenti } from "../../features/investimenti/investimento_slice";
import { getDebiti } from "../../features/debiti/api_calls";
import { selectDebitiDebiti } from "../../features/debiti/debito_slice";
import { getRecurrings } from "../../features/recurrings/api_calls";
import { selectRecurringRecurrings } from "../../features/recurrings/recurring_slice";
import { showToast } from "../../features/ui/ui_slice";
import { relativeTime } from "../../services/dates";

const localeTag = () => (getLocale() === "it" ? "it-IT" : "en-GB");

/** Il conto in attesa di conferma di eliminazione, col suo conto transazioni. */
type PendingDelete = { conto: Conto; transactions: number | null };

const isSalvadanaio = (conto: Conto) => Boolean(conto.budget_obiettivo);
const isCollegato = (conto: Conto) => Boolean(conto.bank_connector_account_id);

const contoIcon = (conto: Conto) => {
  if (isCollegato(conto)) return "pi pi-building-columns";
  if (isSalvadanaio(conto)) return "pi pi-wallet";
  return "pi pi-credit-card";
};

export default function ContiPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const conti = useAppSelector(selectContiConti);
  const loading = useAppSelector(selectContiLoading);
  const budget = useAppSelector(selectContiMonthlyBudget);
  const investimenti = useAppSelector(selectInvestimenti);
  const debiti = useAppSelector(selectDebitiDebiti);
  const recurrings = useAppSelector(selectRecurringRecurrings);
  const isOpenBankingAdmin = useAppSelector(selectIsOpenBankingAdmin);

  const [editing, setEditing] = useState<Conto | null>(null);
  const [isAccountDialogVisible, setIsAccountDialogVisible] = useState(false);
  const [bankAccount, setBankAccount] = useState<Conto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  useEffect(() => {
    dispatch(getConti());
    dispatch(getCurrentMonthExpenses());
    // Le tre voci della lista qui sotto mostrano un valore: senza questi dati
    // la card sarebbe un menu di etichette vuote.
    dispatch(getInvestimenti(undefined));
    dispatch(getDebiti());
    dispatch(getRecurrings(undefined));
  }, [dispatch]);

  const contiTotal = useMemo(
    () => conti.reduce((sum, conto) => sum + Number(conto.saldo), 0),
    [conti],
  );

  const investimentiTotal = useMemo(
    () =>
      investimenti.reduce(
        (sum, titolo) => sum + Number(titolo.valore_posizione ?? 0),
        0,
      ),
    [investimenti],
  );

  const debitiAperti = useMemo(
    () => debiti.filter((debito) => Number(debito.residuo ?? 0) > 0),
    [debiti],
  );

  const debitiTotal = useMemo(
    () => debitiAperti.reduce((sum, debito) => sum + Number(debito.residuo), 0),
    [debitiAperti],
  );

  const ricorrenzeAttive = recurrings.filter(
    (recurring) => recurring.attiva,
  ).length;

  // Patrimonio: quello che c'è sui conti più il valore di mercato dei titoli.
  const netWorth = contiTotal + investimentiTotal;

  // Quanto è cresciuto questo mese. Il patrimonio storico non esiste da
  // nessuna parte: l'unico riferimento onesto è il risparmio del mese, che è
  // per definizione quanto il patrimonio si è mosso da inizio mese.
  const saved = budget.remaining;
  const growth =
    saved !== null && netWorth - saved > 0
      ? (saved / (netWorth - saved)) * 100
      : null;

  const openCreate = () => {
    setEditing(null);
    setIsAccountDialogVisible(true);
  };

  const openEdit = (conto: Conto) => {
    setEditing(conto);
    setIsAccountDialogVisible(true);
  };

  const askDelete = async (conto: Conto) => {
    // L'alert si apre subito e il conteggio arriva quando arriva: aspettare la
    // rete prima di mostrare qualcosa farebbe sembrare il tocco perso.
    setPendingDelete({ conto, transactions: null });

    try {
      const transactions = await dispatch(
        countContoTransactions({ id: conto.id }),
      ).unwrap();

      setPendingDelete((current) =>
        current && current.conto.id === conto.id
          ? { ...current, transactions }
          : current,
      );
    } catch {
      // Il conteggio è informativo: se fallisce chiediamo comunque conferma,
      // con il messaggio prudente.
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    dispatch(deleteConto({ id: pendingDelete.conto.id }));
    dispatch(showToast({ variant: "success", title: t("accounts_deleted") }));
    setPendingDelete(null);
  };

  const deleteMessage = () => {
    if (!pendingDelete) return "";

    const { transactions } = pendingDelete;

    if (transactions === null) return t("delete_conto_error_count");
    if (transactions === 0) return t("delete_conto_message_zero");

    return t("delete_conto_message").replace("{count}", String(transactions));
  };

  return (
    <>
      <Page className="accounts">
        <PageHeader className="accounts__header">
          <div className="accounts__worth">
            <span className="accounts__eyebrow">{t("accounts_net_worth")}</span>
            <Amount className="accounts__worth-value" value={netWorth} />
          </div>

          {growth !== null && (
            <span
              className={`accounts__delta accounts__delta--${
                growth >= 0 ? "up" : "down"
              }`}
            >
              <i
                className={`pi ${growth >= 0 ? "pi-arrow-up-right" : "pi-arrow-down-right"}`}
                aria-hidden="true"
              />
              {`${Math.abs(growth).toFixed(1)}%`}
            </span>
          )}
        </PageHeader>

        <PageContent>
          {loading && conti.length === 0 ? (
            <Card>
              <SkeletonList />
            </Card>
          ) : conti.length === 0 ? (
            <EmptyState
              icon="pi pi-wallet"
              title={t("accounts_empty_title")}
              description={t("accounts_empty_text")}
              actions={
                <Button size="sm" onClick={openCreate}>
                  {t("add_account")}
                </Button>
              }
            />
          ) : (
            <div className="accounts__cards">
              {conti.map((conto) => (
                <ContoCard
                  key={conto.id}
                  conto={conto}
                  actions={
                    <ThreeDotsActionsMenu
                      className="accounts__menu-button"
                      verticalDots
                      items={[
                        {
                          label: t("edit"),
                          icon: "pi pi-pencil",
                          command: () => openEdit(conto),
                        },
                        ...(isOpenBankingAdmin
                          ? [
                              {
                                label: isCollegato(conto)
                                  ? t("bank_connected")
                                  : t("link_bank"),
                                icon: "pi pi-building-columns",
                                command: () => setBankAccount(conto),
                              },
                            ]
                          : []),
                        {
                          label: t("delete"),
                          icon: "pi pi-trash",
                          command: () => askDelete(conto),
                        },
                      ]}
                    />
                  }
                />
              ))}
            </div>
          )}

          {/* Le destinazioni ex-hamburger: da qui si raggiunge il resto dell'app. */}
          <Card className="accounts__menu">
            <List>
              <ListRow
                icon="pi pi-chart-line"
                iconShape="square"
                title={t("nav_investments")}
                meta={
                  investimenti.length > 0
                    ? `${investimenti.length} ${t("accounts_holdings")}`
                    : undefined
                }
                trailing={<Amount value={investimentiTotal} hideCurrency />}
                chevron
                onClick={() => navigate("/investments")}
              />

              <ListRow
                icon="pi pi-receipt"
                iconShape="square"
                iconTone={debitiAperti.length > 0 ? "negative" : "neutral"}
                title={t("nav_debts")}
                meta={
                  debitiAperti.length > 0
                    ? `${debitiAperti.length} ${t("accounts_open_debts")}`
                    : undefined
                }
                trailing={
                  <Amount
                    value={-debitiTotal}
                    tone={debitiTotal > 0 ? "negative" : "neutral"}
                    hideCurrency
                  />
                }
                chevron
                onClick={() => navigate("/debts")}
              />

              <ListRow
                icon="pi pi-tags"
                iconShape="square"
                title={t("taxonomy_title")}
                chevron
                onClick={() => navigate("/categories")}
              />

              <ListRow
                icon="pi pi-refresh"
                iconShape="square"
                title={t("nav_recurrings")}
                trailing={
                  ricorrenzeAttive > 0 ? (
                    <span className="accounts__count">
                      {`${ricorrenzeAttive} ${t("accounts_active")}`}
                    </span>
                  ) : undefined
                }
                chevron
                onClick={() => navigate("/recurrings")}
              />

              <ListRow
                icon="pi pi-cog"
                iconShape="square"
                title={t("nav_settings")}
                chevron
                onClick={() => navigate("/settings")}
              />
            </List>
          </Card>

          <button
            type="button"
            className="accounts__add"
            onClick={openCreate}
          >
            <i className="pi pi-plus" aria-hidden="true" />
            {t("add_account")}
          </button>
        </PageContent>
      </Page>

      <AccountDialog
        visible={isAccountDialogVisible}
        account={editing!}
        onHide={() => {
          setIsAccountDialogVisible(false);
          setEditing(null);
        }}
        loading={loading}
      />

      <BankConnectDialog
        visible={Boolean(bankAccount)}
        conto={bankAccount}
        onHide={() => setBankAccount(null)}
      />

      <Alert
        open={Boolean(pendingDelete)}
        title={t("accounts_delete_title")}
        description={deleteMessage()}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

function ContoCard({
  conto,
  actions,
}: {
  conto: Conto;
  actions: React.ReactNode;
}) {
  const { t } = useI18n();

  const goal = Number(conto.budget_obiettivo ?? 0);
  const saldo = Number(conto.saldo);
  const progress = goal > 0 ? Math.min(1, saldo / goal) : 0;

  const sync = relativeTime(conto.bank_connector_last_sync, localeTag());
  const syncFailed = Boolean(conto.bank_connector_last_error);

  return (
    <Card className="account-card">
      <div className="account-card__top">
        <span className="account-card__icon" aria-hidden="true">
          <i className={contoIcon(conto)} />
        </span>

        <span className="account-card__name">{conto.nome}</span>

        {isCollegato(conto) && (
          <span className="account-card__badge">{t("accounts_linked")}</span>
        )}

        {actions}
      </div>

      <div className="account-card__figures">
        <Amount className="account-card__balance" value={saldo} />

        {goal > 0 ? (
          <span className="account-card__percent">
            {`${Math.round(progress * 100)}%`}
          </span>
        ) : (
          sync && (
            <span
              className={`account-card__sync${
                syncFailed ? " account-card__sync--failed" : ""
              }`}
            >
              {syncFailed
                ? t("accounts_sync_failed")
                : `${t("accounts_sync")} ${sync}`}
            </span>
          )
        )}
      </div>

      {goal > 0 && (
        <>
          <ProgressBar
            label={conto.nome}
            segments={[{ value: progress, tone: "accent" }]}
          />
          <span className="account-card__goal">
            {`${t("accounts_goal")} `}
            <Amount value={goal} decimals={0} />
          </span>
        </>
      )}
    </Card>
  );
}
