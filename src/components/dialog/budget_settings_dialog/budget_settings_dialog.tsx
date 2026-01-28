import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import InputText from "../../input_text/input_text";
import "./budget_settings_dialog.scss";
import { useAppSelector } from "../../../store/store";
import Button from "../../button/button";

// 1. Definiamo la struttura dei dati del budget
interface BudgetData {
  totalBudget: number | null;
}

// 2. Definiamo le Props del componente
interface BudgetSettingsDialogProps {
  visible: boolean;
  onHide: () => void;
  initialData: BudgetData;
  onSave: (data: BudgetData) => Promise<void> | void;
}

const BudgetSettingsDialog: React.FC<BudgetSettingsDialogProps> = ({
  visible,
  onHide,
  initialData,
  onSave,
}) => {
  // Prendiamo il loading dallo slice del profilo (o conto, a seconda di dove lo gestisci)
  const loading = useAppSelector((state) => state.conto.loading);

  const [formData, setFormData] = useState({
    amount: initialData?.totalBudget?.toString() || "",
  });

  // Sincronizziamo lo stato locale se initialData cambia (es. quando la dialog si riapre)
  useEffect(() => {
    setFormData({
      amount: initialData?.totalBudget?.toString() || "",
    });
  }, [initialData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Regex per accettare numeri con virgola o punto
    const validationRegex = /^[0-9]*[.,]?[0-9]*$/;
    if (validationRegex.test(val)) {
      setFormData({ ...formData, amount: val });
    }
  };

  const handleSave = () => {
    const dataToSave: BudgetData = {
      totalBudget: formData.amount
        ? parseFloat(formData.amount.replace(",", "."))
        : null,
    };
    onSave(dataToSave);
  };

  return (
    <Dialog
      header="Impostazioni Budget Mensile"
      visible={visible}
      className="budget-settings-dialog"
      style={{ width: "90vw", maxWidth: "400px" }}
      onHide={onHide}
      footer={
        <div className="buttons-footer-dialog">
          <Button label="Annulla" className="reset-button" onClick={onHide} />
          <Button label="Salva" onClick={handleSave} loading={loading} />
        </div>
      }
      draggable={false}
      resizable={false}
      closable={false}
    >
      <div className="budget-settings-dialog-content">
        <InputText
          value={formData.amount}
          onChange={handleAmountChange}
          placeholder="Esempio: 1200,50"
          icon="pi pi-euro"
          iconPos="right"
          label="Budget Totale (€)"
          className="budget-settings-input"
        />
      </div>
    </Dialog>
  );
};

export default BudgetSettingsDialog;
