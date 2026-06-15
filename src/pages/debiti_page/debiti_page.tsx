import React, { useEffect, useState } from "react";
import { confirmPopup } from "primereact/confirmpopup";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useI18n } from "../../i18n/use-i18n";
import Button from "../../components/button/button";
import { getDebiti, deleteDebito } from "../../features/debiti/api_calls";
import {
  selectDebitiDebiti,
  selectDebitiLoading,
} from "../../features/debiti/debito_slice";
import DebitoDialog from "../../components/dialog/debito_dialog/debito_dialog";
import PayDebitoDialog from "../../components/dialog/pay_debito_dialog/pay_debito_dialog";
import { getConti } from "../../features/conti/api_calls";
import { selectContiConti } from "../../features/conti/conto_slice";
import { Debito } from "../../features/debiti/interfaces";
import "./debiti_page.scss";

export default function DebitiPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const debiti = useAppSelector(selectDebitiDebiti);
  const loading = useAppSelector(selectDebitiLoading);
  const conti = useAppSelector(selectContiConti);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedDebito, setSelectedDebito] = useState<Debito | null>(null);
  const [isPayDialogVisible, setIsPayDialogVisible] = useState(false);
  const [debitoToPay, setDebitoToPay] = useState<Debito | null>(null);

  useEffect(() => {
    dispatch(getDebiti());
    dispatch(getConti());
  }, [dispatch]);

  const openCreateDialog = () => {
    setSelectedDebito(null);
    setIsDialogVisible(true);
  };

  const openEditDialog = (debito: Debito) => {
    setSelectedDebito(debito);
    setIsDialogVisible(true);
  };

  const openPayDialog = (debito: Debito) => {
    setDebitoToPay(debito);
    setIsPayDialogVisible(true);
  };

  const deleteDebt = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    confirmPopup({
      target: event.currentTarget,
      message: t("delete_message"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: t("yes"),
      rejectLabel: t("no"),
      accept: () => {
        dispatch(deleteDebito({ id, force: true }));
      },
    });
  };

  const refreshDebiti = () => {
    dispatch(getDebiti());
  };

  return (
    <>
      <div className="debiti-page">
        <header className="page-header">
          <div className="header-content">
            <h1>{t("debts_title")}</h1>
            <p className="subtitle">{t("debts_subtitle")}</p>
          </div>
        </header>

        <div className="debts-grid">
          {debiti.length > 0 ? (
            debiti.map((debito) => {
              const accountName = conti.find(
                (conto) => conto.id === debito.conto_id,
              )?.nome;
              const residualLabel =
                debito.residuo !== null
                  ? debito.residuo.toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                    })
                  : "-";
              return (
                <article key={debito.id} className="debt-card">
                  <div className="debt-card-top">
                    <div>
                      <h2>{debito.nome}</h2>
                      <div className="debt-badges">
                        <span
                          className={`debt-status ${debito.residuo === 0 ? "paid" : "open"}`}
                        >
                          {debito.residuo === 0
                            ? t("debt_paid")
                            : t("debt_open")}
                        </span>
                      </div>
                    </div>
                    <div className="debt-amounts">
                      <div className="debt-amount-row">
                        <span>{t("debt_amount")}</span>
                        <strong>
                          {debito.ammontare.toLocaleString("it-IT", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          €
                        </strong>
                      </div>
                      <div className="debt-amount-row">
                        <span>{t("debt_residual")}</span>
                        <strong>{residualLabel} €</strong>
                      </div>
                    </div>
                  </div>

                  <div className="debt-card-content">
                    <p>
                      <strong>{t("debt_description")}:</strong>{" "}
                      {debito.descrizione || t("no_description")}
                    </p>
                    {accountName && (
                      <p>
                        <strong>{t("debt_account")}:</strong> {accountName}
                      </p>
                    )}
                  </div>

                  <div className="debt-card-actions">
                    <Button
                      className="trasparent-button"
                      icon="pi pi-pencil"
                      compact
                      onClick={() => openEditDialog(debito)}
                    />
                    <Button
                      className="trasparent-button"
                      icon="pi pi-dollar"
                      compact
                      onClick={() => openPayDialog(debito)}
                      disabled={debito.residuo === 0}
                    />
                    <Button
                      className="trasparent-danger-button"
                      icon="pi pi-trash"
                      compact
                      onClick={(event) => deleteDebt(event, debito.id)}
                    />
                  </div>
                </article>
              );
            })
          ) : (
            <p className="no-data">{t("no_data")}</p>
          )}
        </div>

        <Button
          icon="pi pi-plus"
          className="add-debt-button"
          compact
          rounded
          onClick={openCreateDialog}
        />
      </div>

      <DebitoDialog
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        debito={selectedDebito}
        loading={loading}
        onSaved={refreshDebiti}
      />

      <PayDebitoDialog
        visible={isPayDialogVisible}
        onHide={() => setIsPayDialogVisible(false)}
        debito={debitoToPay}
        loading={loading}
        onPaid={refreshDebiti}
      />
    </>
  );
}
