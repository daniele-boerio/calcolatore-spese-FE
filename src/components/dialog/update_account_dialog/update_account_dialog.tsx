import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import "./update_account_dialog.scss";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { updateConto } from "../../../features/conti/api_calls";
import { useI18n } from "../../../i18n/use-i18n";
import { Conto } from "../../../features/conti/interfaces";

interface UpdateAccountDialogProps {
  visible: boolean;
  onHide: () => void;
  account: Conto;
  loading?: boolean;
}

export default function UpdateAccountDialog({
  visible,
  onHide,
  account,
  loading: externalLoading,
}: UpdateAccountDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const allAccounts = useAppSelector((state) => state.conto.conti);

  // Stati locali popolati direttamente dalle props (sicuro grazie al rendering condizionale)
  const [nome, setNome] = useState(account.nome);
  const [saldo, setSaldo] = useState(account.saldo);
  const [budgetObiettivo, setBudgetObiettivo] = useState(
    account.budget_obiettivo ?? 0,
  );
  const [ricaricaAutomatica, setRicaricaAutomatica] = useState(
    account.ricarica_automatica,
  );
  const [sogliaMinima, setSogliaMinima] = useState(account.soglia_minima ?? 0);
  const [contoSorgenteId, setContoSorgenteId] = useState(
    account.conto_sorgente_id,
  );
  const [frequenzaControllo, setFrequenzaControllo] = useState(
    account.frequenza_controllo,
  );
  const [prossimoControllo, setProssimoControllo] = useState<Date | null>(
    account.prossimo_controllo ? new Date(account.prossimo_controllo) : null,
  );

  const frequenzaOptions = [
    { label: t("weekly"), value: "SETTIMANALE" },
    { label: t("monthly"), value: "MENSILE" },
  ];

  const handleConfirm = async () => {
    if (!nome.trim() || !account.id) return;

    await dispatch(
      updateConto({
        id: account.id,
        nome: nome.trim(),
        saldo,
        budget_obiettivo: budgetObiettivo,
        ricarica_automatica: ricaricaAutomatica,
        soglia_minima: sogliaMinima,
        conto_sorgente_id: contoSorgenteId,
        frequenza_controllo: frequenzaControllo,
        prossimo_controllo: prossimoControllo?.toISOString().split("T")[0], // Formato YYYY-MM-DD
      }),
    ).unwrap();

    onHide();
  };

  return (
    <Dialog
      header={t("edit_account")}
      visible={visible}
      className="account-dialog"
      style={{ width: "95vw", maxWidth: "550px" }}
      onHide={onHide}
      footer={
        <div className="buttons-footer-dialog">
          <Button
            label={t("cancel")}
            className="reset-button"
            onClick={onHide}
          />
          <Button
            label={t("save_changes")}
            onClick={handleConfirm}
            loading={externalLoading}
          />
        </div>
      }
    >
      <div className="account-settings-dialog-content">
        <div className="dialog-grid">
          <InputText
            label={t("account_name")}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <InputText
            label={t("current_balance")}
            value={saldo.toString()}
            onChange={(e) => setSaldo(parseFloat(e.target.value) || 0)}
          />
          <InputText
            label={t("target_budget")}
            value={budgetObiettivo.toString()}
            onChange={(e) =>
              setBudgetObiettivo(parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="recharge-section">
          <div className="switch-container">
            <label>{t("automatic_recharge")}</label>
            <InputSwitch
              checked={ricaricaAutomatica}
              onChange={(e) => setRicaricaAutomatica(e.value)}
            />
          </div>

          {ricaricaAutomatica && (
            <div className="recharge-details animate-fade-in">
              <div className="dialog-grid">
                <InputText
                  label={t("minimum_threshold")}
                  value={sogliaMinima.toString()}
                  onChange={(e) =>
                    setSogliaMinima(parseFloat(e.target.value) || 0)
                  }
                />

                <div className="field">
                  <label className="input-label">{t("frequency")}</label>
                  <Dropdown
                    value={frequenzaControllo}
                    options={frequenzaOptions}
                    onChange={(e) => setFrequenzaControllo(e.value)}
                    placeholder={t("select_frequency")}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="dialog-grid">
                <div className="field">
                  <label className="input-label">{t("next_check")}</label>
                  <Calendar
                    value={prossimoControllo}
                    onChange={(e) => setProssimoControllo(e.value as Date)}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-full"
                  />
                </div>

                <div className="field">
                  <label className="input-label">{t("source_account")}</label>
                  <Dropdown
                    value={contoSorgenteId}
                    options={allAccounts.filter((a) => a.id !== account.id)}
                    onChange={(e) => setContoSorgenteId(e.value)}
                    optionLabel="nome"
                    optionValue="id"
                    placeholder={t("select_source")}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
