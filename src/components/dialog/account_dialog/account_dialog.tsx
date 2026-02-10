import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { Calendar } from "primereact/calendar"; // Tornato al componente standard
import Dropdown from "../../dropdown/dropdown";
import InputText from "../../input_text/input_text";
import InputNumber from "../../input_number/input_number";
import Button from "../../button/button";
import "./account_dialog.scss";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { createConto, updateConto } from "../../../features/conti/api_calls";
import { useI18n } from "../../../i18n/use-i18n";
import { Conto } from "../../../features/conti/interfaces";

interface AccountDialogProps {
  visible: boolean;
  onHide: () => void;
  account?: Conto | null;
  loading?: boolean;
}

export default function AccountDialog({
  visible,
  onHide,
  account,
  loading: externalLoading,
}: AccountDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const allAccounts = useAppSelector((state) => state.conto.conti);

  const [nome, setNome] = useState("");
  const [saldo, setSaldo] = useState<number | null>(0);
  const [budgetObiettivo, setBudgetObiettivo] = useState<number | null>(0);
  const [ricaricaAutomatica, setRicaricaAutomatica] = useState(false);
  const [sogliaMinima, setSogliaMinima] = useState<number | null>(0);
  const [contoSorgenteId, setContoSorgenteId] = useState<string | null>(null);
  const [frequenzaControllo, setFrequenzaControllo] = useState<string | null>(
    null,
  );
  const [prossimoControllo, setProssimoControllo] = useState<Date | null>(null);

  useEffect(() => {
    if (visible) {
      if (account) {
        setNome(account.nome);
        setSaldo(account.saldo);
        setBudgetObiettivo(account.budget_obiettivo ?? 0);
        setRicaricaAutomatica(account.ricarica_automatica);
        setSogliaMinima(account.soglia_minima ?? 0);
        setContoSorgenteId(account.conto_sorgente_id ?? null);
        setFrequenzaControllo(account.frequenza_controllo ?? null);
        setProssimoControllo(
          account.prossimo_controllo
            ? new Date(account.prossimo_controllo)
            : null,
        );
      } else {
        setNome("");
        setSaldo(0);
        setBudgetObiettivo(0);
        setRicaricaAutomatica(false);
        setSogliaMinima(0);
        setContoSorgenteId(null);
        setFrequenzaControllo(null);
        setProssimoControllo(null);
      }
    }
  }, [visible, account]);

  const frequenzaOptions = [
    { label: t("weekly"), value: "SETTIMANALE" },
    { label: t("monthly"), value: "MENSILE" },
  ];

  const handleConfirm = async () => {
    if (!nome.trim()) return;

    const payload = {
      nome: nome.trim(),
      saldo: saldo ?? 0,
      budget_obiettivo: budgetObiettivo ?? 0,
      ricarica_automatica: ricaricaAutomatica,
      soglia_minima: ricaricaAutomatica ? (sogliaMinima ?? 0) : undefined,
      conto_sorgente_id: ricaricaAutomatica
        ? (contoSorgenteId ?? undefined)
        : undefined,
      frequenza_controllo: ricaricaAutomatica
        ? (frequenzaControllo ?? undefined)
        : undefined,
      prossimo_controllo:
        ricaricaAutomatica && prossimoControllo
          ? prossimoControllo.toISOString().split("T")[0]
          : undefined,
    };

    if (account?.id) {
      await dispatch(updateConto({ id: account.id, ...payload })).unwrap();
    } else {
      await dispatch(createConto(payload)).unwrap();
    }

    onHide();
  };

  return (
    <Dialog
      header={account ? t("edit_account") : t("add_account")}
      visible={visible}
      className="account-dialog"
      style={{ width: "95vw", maxWidth: "50rem" }}
      onHide={onHide}
      footer={
        <div className="buttons-footer-dialog">
          <Button
            label={t("cancel")}
            className="reset-button"
            onClick={onHide}
          />
          <Button
            label={account ? t("save_changes") : t("create_account")}
            onClick={handleConfirm}
            loading={externalLoading}
            disabled={!nome.trim()}
          />
        </div>
      }
      draggable={false}
      resizable={false}
    >
      <div className="account-settings-dialog-content">
        <div className="form-row">
          <div className="field">
            <InputText
              label={t("account_name")}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={t("account_placeholder")}
              autoFocus
            />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <InputNumber
              label={t("current_balance")}
              value={saldo}
              onChange={(e) => setSaldo(e.value ?? 0)}
              mode="currency"
              currency="EUR"
            />
          </div>
          <div className="field">
            <InputNumber
              label={t("target_budget")}
              value={budgetObiettivo}
              onChange={(e) => setBudgetObiettivo(e.value ?? 0)}
              mode="currency"
              currency="EUR"
            />
          </div>
        </div>

        <div className="recharge-section">
          <div className="switch-container">
            <label className="field-label">{t("automatic_recharge")}</label>
            <InputSwitch
              checked={ricaricaAutomatica}
              onChange={(e) => setRicaricaAutomatica(e.value)}
            />
          </div>

          {ricaricaAutomatica && (
            <div className="recharge-details animate-fade-in">
              <div className="form-row">
                <div className="field">
                  <InputNumber
                    label={t("minimum_threshold")}
                    value={sogliaMinima}
                    onChange={(e) => setSogliaMinima(e.value ?? 0)}
                    mode="currency"
                    currency="EUR"
                  />
                </div>
                <div className="field">
                  <Dropdown
                    label={t("frequency")}
                    value={frequenzaControllo}
                    options={frequenzaOptions}
                    onChange={(e) => setFrequenzaControllo(e.value)}
                    placeholder={t("select_frequency")}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <div className="calendar-field">
                    <label className="field-label">{t("next_check")}</label>
                    <Calendar
                      value={prossimoControllo}
                      onChange={(e) => setProssimoControllo(e.value as Date)}
                      dateFormat="dd/mm/yy"
                      showIcon
                      minDate={new Date()}
                      inputClassName="p-inputtext" // Applica lo stile a linea inferiore
                    />
                  </div>
                </div>
                <div className="field">
                  <Dropdown
                    label={t("source_account")}
                    value={contoSorgenteId}
                    options={allAccounts.filter((a) => a.id !== account?.id)}
                    onChange={(e) => setContoSorgenteId(e.value)}
                    optionLabel="nome"
                    optionValue="id"
                    placeholder={t("select_source")}
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
