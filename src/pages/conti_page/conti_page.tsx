import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n/use-i18n";
import { getLocale } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { Page, PageContent, PageHeader } from "../../components/page/page";
import { Card } from "../../components/card/card";
import Amount from "../../components/amount/amount";
import Alert from "../../components/alert/alert";
import ProgressBar from "../../components/progress_bar/progress_bar";
import SkeletonList from "../../components/skeleton/skeleton";
import PickerSheet from "../../components/picker_sheet/picker_sheet";
import ThreeDotsActionsMenu from "../../components/three_dots_action_menu/three_dots_action_menu";
import AccountDialog from "../../components/dialog/account_dialog/account_dialog";
import BankConnectDialog from "../../components/dialog/bank_connect_dialog/bank_connect_dialog";
import "./conti_page.scss";
import {
  absorbVirtualConto,
  consolidateConti,
  countContoTransactions,
  deleteConto,
  getConti,
} from "../../features/conti/api_calls";
import { Conto } from "../../features/conti/interfaces";
import {
  selectContiConti,
  selectContiLoading,
} from "../../features/conti/conto_slice";
import { selectIsOpenBankingAdmin } from "../../features/profile/profile_slice";
import { getInvestimenti } from "../../features/investimenti/api_calls";
import { selectInvestimenti } from "../../features/investimenti/investimento_slice";
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

  const conti = useAppSelector(selectContiConti);
  const loading = useAppSelector(selectContiLoading);
  const investimenti = useAppSelector(selectInvestimenti);
  const isOpenBankingAdmin = useAppSelector(selectIsOpenBankingAdmin);

  const [editing, setEditing] = useState<Conto | null>(null);
  const [isAccountDialogVisible, setIsAccountDialogVisible] = useState(false);
  const [bankAccount, setBankAccount] = useState<Conto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [confirmingMerge, setConfirmingMerge] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [orphans, setOrphans] = useState(0);

  useEffect(() => {
    dispatch(getConti());
    // Il patrimonio conta anche il valore di mercato dei titoli.
    dispatch(getInvestimenti(undefined));
  }, [dispatch]);

  // Il conto che l'app ha aperto da sé non compare in elenco: esiste perché
  // una transazione deve pur appoggiarsi da qualche parte, non perché
  // l'utente abbia deciso di avere un conto.
  const virtuale = conti.find((conto) => conto.virtuale);
  const visibili = useMemo(
    () => conti.filter((conto) => !conto.virtuale),
    [conti],
  );

  // Quanti movimenti sono rimasti sul conto invisibile. Finché non esiste un
  // conto vero non interessa a nessuno: è la condizione qui sotto a decidere
  // se il conteggio si vede, non il conteggio stesso.
  useEffect(() => {
    if (!virtuale || visibili.length === 0) return;

    let alive = true;

    dispatch(countContoTransactions({ id: virtuale.id }))
      .unwrap()
      .then((total) => alive && setOrphans(total))
      .catch(() => alive && setOrphans(0));

    return () => {
      alive = false;
    };
  }, [dispatch, virtuale, visibili.length]);

  const showOrphans =
    Boolean(virtuale) && visibili.length > 0 && orphans > 0;

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

  const netWorth = contiTotal + investimentiTotal;

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

  const merge = async () => {
    setConfirmingMerge(false);

    try {
      await dispatch(consolidateConti()).unwrap();
      await dispatch(getConti());
      dispatch(showToast({ variant: "success", title: t("accounts_merged") }));
    } catch {
      // L'errore arriva dal middleware.
    }
  };

  const assign = async (contoId: string | null) => {
    setAssignOpen(false);
    if (!contoId) return;

    try {
      await dispatch(absorbVirtualConto({ id: contoId })).unwrap();
      await dispatch(getConti());
      dispatch(showToast({ variant: "success", title: t("accounts_assigned") }));
    } catch {
      // L'errore arriva dal middleware.
    }
  };

  return (
    <>
      <Page className="accounts">
        <PageHeader className="accounts__header">
          <div className="accounts__worth">
            <span className="accounts__eyebrow">{t("accounts_net_worth")}</span>
            <Amount className="accounts__worth-value" value={netWorth} />
          </div>

          <button
            type="button"
            className="accounts__add"
            aria-label={t("add_account")}
            onClick={openCreate}
          >
            <i className="pi pi-plus" aria-hidden="true" />
          </button>
        </PageHeader>

        <PageContent>
          {loading && conti.length === 0 && (
            <Card>
              <SkeletonList />
            </Card>
          )}

          {visibili.length > 0 && (
            <div className="accounts__cards">
              {visibili.map((conto) => (
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

          {showOrphans && (
            <Card className="accounts__orphans">
              <div className="accounts__orphans-text">
                <span className="accounts__orphans-title">
                  {`${orphans} ${t("accounts_orphans")}`}
                </span>
                <span className="accounts__orphans-hint">
                  {t("accounts_orphans_hint")}
                </span>
              </div>

              <button
                type="button"
                className="accounts__orphans-action"
                onClick={() => setAssignOpen(true)}
              >
                {t("accounts_assign")}
              </button>
            </Card>
          )}

          {conti.length > 1 && (
            <button
              type="button"
              className="accounts__merge"
              onClick={() => setConfirmingMerge(true)}
            >
              <i className="pi pi-arrow-right-arrow-left" aria-hidden="true" />
              {t("accounts_merge")}
            </button>
          )}
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

      <PickerSheet
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={t("accounts_assign_title")}
        options={visibili.map((conto) => ({
          id: conto.id,
          label: conto.nome,
        }))}
        value={null}
        onSelect={assign}
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

      <Alert
        open={confirmingMerge}
        tone="accent"
        icon="pi pi-arrow-right-arrow-left"
        title={t("accounts_merge_title")}
        description={t("accounts_merge_text")}
        confirmLabel={t("accounts_merge_confirm")}
        cancelLabel={t("cancel")}
        onConfirm={merge}
        onCancel={() => setConfirmingMerge(false)}
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
