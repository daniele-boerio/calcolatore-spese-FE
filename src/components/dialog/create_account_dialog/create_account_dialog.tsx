import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import "./create_account_dialog.scss";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { createConto } from "../../../features/conti/api_calls"; // Assicurati che l'import sia corretto
import { useI18n } from "../../../i18n/use-i18n";

interface CreateAccountDialogProps {
  visible: boolean;
  onHide: () => void;
  loading?: boolean;
}

export default function CreateAccountDialog({
  visible,
  onHide,
  loading: externalLoading,
}: CreateAccountDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const allAccounts = useAppSelector((state) => state.conto.conti);

  // Stati locali con valori iniziali vuoti
  const [nome, setNome] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [budgetObiettivo, setBudgetObiettivo] = useState(0);
  const [ricaricaAutomatica, setRicaricaAutomatica] = useState(false);
  const [sogliaMinima, setSogliaMinima] = useState(0);
  const [contoSorgenteId, setContoSorgenteId] = useState<string | null>(null);
  const [frequenzaControllo, setFrequenzaControllo] = useState<string | null>(
    null,
  );
  const [prossimoControllo, setProssimoControllo] = useState<Date | null>(null);

  const frequenzaOptions = [
    { label: t("weekly"), value: "SETTIMANALE" },
    { label: t("monthly"), value: "MENSILE" },
  ];

  const handleConfirm = async () => {
    if (!nome.trim()) return;

    await dispatch(
      createConto({
        nome: nome.trim(),
        saldo,
        budget_obiettivo: budgetObiettivo,
        ricarica_automatica: ricaricaAutomatica,
        soglia_minima: sogliaMinima !== 0 ? sogliaMinima : undefined,
        conto_sorgente_id: contoSorgenteId ?? undefined,
        frequenza_controllo: frequenzaControllo ?? undefined,
        prossimo_controllo: prossimoControllo
          ? prossimoControllo?.toISOString().split("T")[0]
          : undefined,
      }),
    ).unwrap();

    // Reset degli stati dopo la creazione
    setNome("");
    setSaldo(0);
    setBudgetObiettivo(0);
    setRicaricaAutomatica(false);
    onHide();
  };

  return (
    <Dialog
      header={t("add_account")}
      visible={visible}
      className="account-dialog"
      style={{ width: "90vw", maxWidth: "50rem" }}
      onHide={onHide}
      footer={
        <div className="buttons-footer-dialog">
          <Button
            label={t("cancel")}
            className="reset-button"
            onClick={onHide}
          />
          <Button
            label={t("create_account")}
            onClick={handleConfirm}
            loading={externalLoading}
            disabled={!nome.trim()}
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
            placeholder={t("account_placeholder")}
            autoFocus
          />
          <InputText
            label={t("initial_balance")}
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
                    minDate={new Date()} // Non si può programmare nel passato
                  />
                </div>

                <div className="field">
                  <label className="input-label">{t("source_account")}</label>
                  <Dropdown
                    value={contoSorgenteId}
                    options={allAccounts}
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
