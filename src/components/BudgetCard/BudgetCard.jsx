import React, { useState } from "react";
import Button from "../Button/Button";
import "./BudgetCard.scss";
import BudgetSettingsDialog from "../Dialog/BudgetSettingsDialog/BudgetSettingsDialog";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateBudget } from "../../features/conti/apiCalls";

const BudgetCard = () => {
  const dispatch = useAppDispatch();

  // Selettori tipizzati grazie al setup di store.ts
  const monthlyBudget = useAppSelector((state) => state.conto.monthlyBudget);
  const loading = useAppSelector((state) => state.conto.loading); // Preso da conto come nello slice precedente

  const { totalBudget, expenses, percentage } = monthlyBudget;

  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const hasTotalBudget = totalBudget !== null && totalBudget !== undefined;
  const hasPercentage = percentage !== null && percentage !== undefined;

  // Tipizziamo i dati in entrata dal Dialog
  const handleSaveBudget = async (updatedData) => {
    try {
      await dispatch(updateBudget(updatedData)).unwrap();
      setIsDialogVisible(false);
    } catch (error) {
      console.error("Errore aggiornamento budget:", error);
    }
  };

  const formatEuro = (value) => {
    if (value === null || value === undefined) return "€0";
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Logica per le classi CSS
  let statusClass = "is-neutral";
  if (hasTotalBudget && expenses !== null) {
    statusClass = totalBudget < expenses ? "is-danger" : "is-success";
  }

  return (
    <div className={`budget-card ${statusClass}`}>
      <div className="budget-card__header-row">
        <span className="budget-card__label">
          {hasTotalBudget ? "Budget Mensile" : "Spese Mensili"}
        </span>

        <Button
          className="trasparent-button"
          icon="pi pi-cog"
          compact
          rounded
          onClick={() => setIsDialogVisible(true)}
          loading={loading}
        />
      </div>

      <div className="budget-card__amount-container">
        <h2 className="budget-card__amount">{formatEuro(expenses)}</h2>

        {hasTotalBudget && (
          <span className="budget-card__summary">
            <span className="text-muted">di</span> {formatEuro(totalBudget)}
          </span>
        )}
      </div>

      {hasPercentage && (
        <div className="budget-card__footer-row">
          <div className="budget-card__progress-container">
            <div className="budget-card__track">
              <div
                className="budget-card__fill"
                style={{ width: `${Math.min(percentage, 100)}%` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <span className="budget-card__percentage">{percentage}%</span>
          </div>
        </div>
      )}

      <BudgetSettingsDialog
        key={isDialogVisible ? "open" : "closed"}
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        initialData={{ total_budget: totalBudget }} // Passiamo i dati nel formato atteso dallo schema
        onSave={handleSaveBudget}
      />
    </div>
  );
};

export default BudgetCard;
