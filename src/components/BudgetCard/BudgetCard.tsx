import React, { useState } from "react";
import Button from "../Button/Button";
import "./BudgetCard.scss";
import BudgetSettingsDialog from "../Dialog/BudgetSettingsDialog/BudgetSettingsDialog";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateBudget } from "../../features/conti/apiCalls";
import { BudgetUpdateData } from "../../features/conti/interfaces";

const BudgetCard: React.FC = () => {
  const dispatch = useAppDispatch();

  // Selettori ora tipizzati correttamente dallo store globale
  const monthlyBudget = useAppSelector((state) => state.conto.monthlyBudget);
  const loading = useAppSelector((state) => state.conto.loading);

  const { totalBudget, expenses, percentage } = monthlyBudget;

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

  // Helper per la leggibilità del template
  const hasTotalBudget = totalBudget !== null && totalBudget !== undefined;
  // Gestiamo il caso in cui percentage sia 0 (valore falsy in JS)
  const hasPercentage = percentage !== null && percentage !== undefined;

  const handleSaveBudget = async (
    updatedData: BudgetUpdateData,
  ): Promise<void> => {
    try {
      await dispatch(updateBudget(updatedData)).unwrap();
      setIsDialogVisible(false);
    } catch (error) {
      // L'errore viene già gestito dal middleware globale, qui logghiamo solo per debug
      console.error("Errore salvataggio budget:", error);
    }
  };

  const formatEuro = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "€0";
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Logica dinamica per le classi di stato
  const getStatusClass = (): string => {
    if (!hasTotalBudget || expenses === null) return "is-neutral";
    return totalBudget < expenses ? "is-danger" : "is-success";
  };

  return (
    <div className={`budget-card ${getStatusClass()}`}>
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
            <span className="budget-card__percentage">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      )}

      <BudgetSettingsDialog
        key={isDialogVisible ? "open" : "closed"}
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        initialData={{ totalBudget: totalBudget ?? null }}
        onSave={handleSaveBudget}
      />
    </div>
  );
};

export default BudgetCard;
