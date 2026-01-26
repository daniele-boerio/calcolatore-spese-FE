import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import Button from "../../Button/Button";
import InputText from "../../InputText/InputText";
import "./BudgetSettingsDialog.scss"; // Importa il nuovo file
import { useAppSelector } from "../../../store/store";

const BudgetSettingsDialog = ({ visible, onHide, initialData, onSave }) => {
  const loading = useAppSelector((state) => state.profile.loading);

  const [formData, setFormData] = useState({
    amount: initialData?.totalBudget?.toString() || "",
  });

  const handleAmountChange = (e) => {
    const val = e.target.value;
    const validationRegex = /^[0-9]*[.,]?[0-9]*$/;
    if (validationRegex.test(val)) {
      setFormData({ ...formData, amount: val });
    }
  };

  const handleSave = () => {
    const dataToSave = {
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
      className="budget-settings-dialog" // Classe per la dialog
      style={{ width: "90vw", maxWidth: "400px" }}
      onHide={onHide}
      footer={
        <div className="buttons-footer-dialog">
          <Button label="Annulla" className="reset-button" onClick={onHide} />
          <Button label="Salva" onClick={handleSave} />
        </div>
      }
      draggable={false}
      resizable={false}
      closable={false}
      loading={loading}
    >
      <div className="budget-settings-dialog-content">
        <InputText
          value={formData.amount}
          onChange={handleAmountChange}
          placeholder="Esempio: 1200,50"
          icon="pi pi-euro"
          iconPos="right"
          label="Budget Totale (€)"
          keyfilter={/[0-9.,]/}
          className="budget-settings-input"
        />
      </div>
    </Dialog>
  );
};

export default BudgetSettingsDialog;
