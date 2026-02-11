import React, { useState } from "react";
import Button from "../button/button";
import "./budget_card.scss";
import BudgetSettingsDialog from "../dialog/budget_settings_dialog/budget_settings_dialog";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateBudget } from "../../features/conti/api_calls";
import { BudgetUpdateData } from "../../features/conti/interfaces";
import { useI18n } from "../../i18n/use-i18n";
import { ProgressBar } from "primereact/progressbar";
import {
  selectContiLoading,
  selectContiMonthlyBudget,
} from "../../features/conti/conto_slice";

export default function BudgetCard() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Selettori ora tipizzati correttamente dallo store globale
  const monthlyBudget = useAppSelector(selectContiMonthlyBudget);
  const loading = useAppSelector(selectContiLoading);

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
      console.error("Errore salvataggio budget:", error);
    }
  };

  const formatEuro = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "€0";
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
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
          {hasTotalBudget ? t("monthly_budget") : t("monthly_expenses")}
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
            <ProgressBar
              value={Math.min(percentage, 100)}
              showValue={false}
              style={{ height: "0.375rem", flex: 1 }}
            />
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
}
