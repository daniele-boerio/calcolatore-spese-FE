import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { Calendar } from "primereact/calendar"; // Tornato al componente standard
import Dropdown from "../../dropdown/dropdown";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import "./account_dialog.scss";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { createConto, updateConto } from "../../../features/conti/api_calls";
import { useI18n } from "../../../i18n/use-i18n";
import { Conto } from "../../../features/conti/interfaces";
import { ColorPicker } from "primereact/colorpicker";
import Switch from "../../switch/switch";

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
  const [saldo, setSaldo] = useState<string>("");
  const [budgetObiettivo, setBudgetObiettivo] = useState<string>("");
  const [ricaricaAutomatica, setRicaricaAutomatica] = useState(false);
  const [sogliaMinima, setSogliaMinima] = useState<string>("");
  const [contoSorgenteId, setContoSorgenteId] = useState<string | null>(null);
  const [frequenzaControllo, setFrequenzaControllo] = useState<string | null>(
    null,
  );
  const [prossimoControllo, setProssimoControllo] = useState<Date | null>(null);

  const [color, setColor] = useState("4b6cb7");

  useEffect(() => {
    if (visible) {
      if (account) {
        setNome(account.nome);
        setSaldo(account.saldo.toString());
        setBudgetObiettivo(
          account.budget_obiettivo ? account.budget_obiettivo.toString() : "",
        );
        setRicaricaAutomatica(account.ricarica_automatica);
        setSogliaMinima(
          account.soglia_minima ? account.soglia_minima.toString() : "",
        );
        setContoSorgenteId(account.conto_sorgente_id ?? null);
        setFrequenzaControllo(account.frequenza_controllo ?? null);
        setProssimoControllo(
          account.prossimo_controllo
            ? new Date(account.prossimo_controllo)
            : null,
        );
        setColor(account.color || "4b6cb7");
      } else {
        setNome("");
        setSaldo("");
        setBudgetObiettivo("");
        setRicaricaAutomatica(false);
        setSogliaMinima("");
        setContoSorgenteId(null);
        setFrequenzaControllo(null);
        setProssimoControllo(null);
        setColor("4b6cb7");
      }
    }
  }, [visible, account]);

  const frequenzaOptions = [
    { label: t("weekly"), value: "SETTIMANALE" },
    { label: t("monthly"), value: "MENSILE" },
  ];

  const handleConfirm = async () => {
    if (!nome.trim()) return;

    const numericSaldo = parseFloat(saldo);
    const numericBudget = parseFloat(budgetObiettivo);
    const numericSogliaMinima = parseFloat(sogliaMinima);

    const payload = {
      nome: nome.trim(),
      saldo: isNaN(numericSaldo) ? 0 : numericSaldo,
      budget_obiettivo: isNaN(numericBudget) ? 0 : numericBudget,
      ricarica_automatica: ricaricaAutomatica,
      soglia_minima: ricaricaAutomatica
        ? isNaN(numericSogliaMinima)
          ? 0
          : numericSogliaMinima
        : 0,
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
      color: `#${color}`,
    };

    if (account?.id) {
      await dispatch(updateConto({ id: account.id, ...payload })).unwrap();
    } else {
      await dispatch(createConto(payload)).unwrap();
    }

    onHide();
  };

  const handleNumberChange = (val: string, fun: any) => {
    let cleanedValue = val.replace(",", ".");
    if (cleanedValue === "" || /^\d*\.?\d{0,2}$/.test(cleanedValue)) {
      fun(cleanedValue);
    }
  };

  return (
    <Dialog
      header={account ? t("edit_account") : t("add_account")}
      visible={visible}
      className="dialog-custom account-dialog"
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
            className="action-button"
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
            <InputText
              value={saldo}
              onChange={(e) => handleNumberChange(e.target.value, setSaldo)}
              label={t("current_balance")}
              icon="pi pi-euro"
              iconPos="right"
              keyfilter={/^\d*[.,]?\d{0,2}$/} // Filtro lato PrimeReact
              inputMode="decimal" // Forza tastiera numerica con punto/virgola su mobile
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <InputText
              value={budgetObiettivo}
              onChange={(e) =>
                handleNumberChange(e.target.value, setBudgetObiettivo)
              }
              label={t("target_budget")}
              icon="pi pi-euro"
              iconPos="right"
              keyfilter={/^\d*[.,]?\d{0,2}$/} // Filtro lato PrimeReact
              inputMode="decimal" // Forza tastiera numerica con punto/virgola su mobile
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field-label">{t("account_color")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ColorPicker
                className="color-picker-custom"
                style={
                  { "--selected-color": `#${color}` } as React.CSSProperties
                }
                value={color}
                onChange={(e) => setColor(e.value as string)}
              />
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  fontFamily: "monospace",
                }}
              >
                #{color}
              </span>
            </div>
          </div>
        </div>

        <div className="recharge-section">
          <div className="switch-container">
            <label className="field-label">{t("automatic_recharge")}</label>
            <Switch
              checked={ricaricaAutomatica}
              onChange={(e) => setRicaricaAutomatica(e.value)}
            />
          </div>

          {ricaricaAutomatica && (
            <div className="recharge-details animate-fade-in">
              <div className="form-row">
                <div className="field">
                  <InputText
                    value={sogliaMinima}
                    onChange={(e) =>
                      handleNumberChange(e.target.value, setSogliaMinima)
                    }
                    label={t("minimum_threshold")}
                    icon="pi pi-euro"
                    iconPos="right"
                    keyfilter={/^\d*[.,]?\d{0,2}$/} // Filtro lato PrimeReact
                    inputMode="decimal" // Forza tastiera numerica con punto/virgola su mobile
                    placeholder="0.00"
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
