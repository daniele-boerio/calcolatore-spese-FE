import React, { useEffect, useState } from "react";
import { confirmPopup } from "primereact/confirmpopup";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useI18n } from "../../i18n/use-i18n";
import Button from "../../components/button/button";
import {
  getInvestimenti,
  deleteInvestimento,
} from "../../features/investimenti/api_calls";
import {
  selectInvestimenti,
  selectInvestimentiLoading,
} from "../../features/investimenti/investimento_slice";
import { Investimento } from "../../features/investimenti/interfaces";
import InvestimentoDialog from "../../components/dialog/investimento_dialog/investimento_dialog";
import OperazioniDialog from "../../components/dialog/operazioni_dialog/operazioni_dialog";
import "./investimenti_page.scss";

export default function InvestimentiPage() {
  const { t, locale } = useI18n();
  const dispatch = useAppDispatch();

  const investimenti = useAppSelector(selectInvestimenti);
  const loading = useAppSelector(selectInvestimentiLoading);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selected, setSelected] = useState<Investimento | null>(null);
  const [isOpsVisible, setIsOpsVisible] = useState(false);
  const [opsInvestimento, setOpsInvestimento] = useState<Investimento | null>(
    null,
  );

  useEffect(() => {
    dispatch(getInvestimenti());
  }, [dispatch]);

  const dateLocale = locale === "it" ? "it-IT" : "en-US";

  const fmtMoney = (n: number) =>
    n.toLocaleString(dateLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtQty = (n: number) =>
    n.toLocaleString(dateLocale, { maximumFractionDigits: 6 });

  const openCreate = () => {
    setSelected(null);
    setIsDialogVisible(true);
  };

  const openEdit = (inv: Investimento) => {
    setSelected(inv);
    setIsDialogVisible(true);
  };

  const openOps = (inv: Investimento) => {
    setOpsInvestimento(inv);
    setIsOpsVisible(true);
  };

  const handleDelete = (
    event: React.MouseEvent<unknown>,
    id: string,
  ) => {
    confirmPopup({
      target: event.currentTarget as HTMLElement,
      message: t("delete_message"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: t("yes"),
      rejectLabel: t("no"),
      accept: () => {
        dispatch(deleteInvestimento({ id }));
      },
    });
  };

  // L'investimento aperto nel dialog operazioni deve riflettere gli aggiornamenti
  const liveOpsInvestimento = opsInvestimento
    ? investimenti.find((i) => String(i.id) === String(opsInvestimento.id)) ||
      opsInvestimento
    : null;

  return (
    <>
      <div className="investimenti-page">
        <header className="page-header">
          <div className="header-content">
            <h1>{t("investments_title")}</h1>
            <p className="subtitle">{t("investments_subtitle")}</p>
          </div>
        </header>

        <div className="investments-grid">
          {investimenti.length > 0 ? (
            investimenti.map((inv) => {
              const qty = inv.quantita_totale ?? 0;
              const avgCost = inv.prezzo_medio_carico ?? 0;
              const invested = qty * avgCost;
              const hasPrice =
                inv.prezzo_attuale !== null &&
                inv.prezzo_attuale !== undefined &&
                inv.prezzo_attuale > 0;
              const marketValue = inv.valore_posizione ?? 0;
              const pnl = hasPrice ? marketValue - invested : 0;
              const pnlPct = hasPrice && invested > 0 ? (pnl / invested) * 100 : 0;
              const pnlClass = pnl > 0 ? "positive" : pnl < 0 ? "negative" : "";

              return (
                <article key={inv.id} className="investment-card">
                  <div className="inv-card-top">
                    <div className="inv-title">
                      <h2>{inv.nome_titolo}</h2>
                      <div className="inv-tags">
                        {inv.ticker && (
                          <span className="inv-tag ticker">{inv.ticker}</span>
                        )}
                        {inv.isin && (
                          <span className="inv-tag isin">{inv.isin}</span>
                        )}
                      </div>
                    </div>
                    {hasPrice && (
                      <span className={`inv-pnl-badge ${pnlClass}`}>
                        {pnl >= 0 ? "+" : ""}
                        {fmtMoney(pnl)} € ({pnl >= 0 ? "+" : ""}
                        {pnlPct.toFixed(2)}%)
                      </span>
                    )}
                  </div>

                  <div className="inv-metrics">
                    <div className="inv-metric">
                      <span>{t("investment_quantity")}</span>
                      <strong>{fmtQty(qty)}</strong>
                    </div>
                    <div className="inv-metric">
                      <span>{t("investment_avg_cost")}</span>
                      <strong>{fmtMoney(avgCost)} €</strong>
                    </div>
                    <div className="inv-metric">
                      <span>{t("investment_invested")}</span>
                      <strong>{fmtMoney(invested)} €</strong>
                    </div>
                    <div className="inv-metric">
                      <span>{t("investment_current_price")}</span>
                      <strong>{hasPrice ? `${fmtMoney(inv.prezzo_attuale as number)} €` : "—"}</strong>
                    </div>
                    <div className="inv-metric highlight">
                      <span>{t("investment_market_value")}</span>
                      <strong>{hasPrice ? `${fmtMoney(marketValue)} €` : "—"}</strong>
                    </div>
                  </div>

                  {inv.data_ultimo_aggiornamento && (
                    <p className="inv-updated">
                      {t("investment_last_update")}:{" "}
                      {new Date(
                        inv.data_ultimo_aggiornamento,
                      ).toLocaleDateString(dateLocale)}
                    </p>
                  )}

                  <div className="inv-card-actions">
                    <Button
                      className="trasparent-button"
                      icon="pi pi-list"
                      label={t("investment_operations")}
                      iconPos="left"
                      compact
                      onClick={() => openOps(inv)}
                    />
                    <Button
                      className="trasparent-button"
                      icon="pi pi-pencil"
                      compact
                      onClick={() => openEdit(inv)}
                    />
                    <Button
                      className="trasparent-danger-button"
                      icon="pi pi-trash"
                      compact
                      onClick={(event) => handleDelete(event, inv.id)}
                    />
                  </div>
                </article>
              );
            })
          ) : (
            <p className="no-data">{loading ? t("loading") : t("no_data")}</p>
          )}
        </div>

        <Button
          icon="pi pi-plus"
          className="add-investment-button"
          compact
          rounded
          onClick={openCreate}
        />
      </div>

      <InvestimentoDialog
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        investimento={selected}
      />

      <OperazioniDialog
        visible={isOpsVisible}
        onHide={() => setIsOpsVisible(false)}
        investimento={liveOpsInvestimento}
      />
    </>
  );
}
