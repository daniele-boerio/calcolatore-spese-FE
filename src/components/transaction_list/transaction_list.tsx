import React, { useEffect } from "react";
import "./transaction_list.scss";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { getLastTransactions } from "../../features/transactions/api_calls";
import { Transaction } from "../../features/transactions/interfaces";
import { useI18n } from "../../i18n/use-i18n";

interface TransactionListProps {
  num: number;
}

export default function TransactionList({ num }: TransactionListProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Utilizziamo lo stato tipizzato. Nota: assicurati che nel rootReducer si chiami 'transactions'
  const { transactions, loading } = useAppSelector(
    (state) => state.transaction,
  );

  useEffect(() => {
    dispatch(getLastTransactions(num));
  }, [dispatch, num]);

  // Formattatore per la data (es: 22 gen 2026)
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="transaction-list-container">
      <h3 className="transaction-list-title">{t("latest_transactions")}</h3>

      {loading ? (
        <div className="loading-spinner">
          <i
            className="pi pi-spin pi-spinner"
            style={{ marginRight: "10px" }}
          ></i>
          {t("loading")}
        </div>
      ) : transactions.length === 0 ? (
        <p className="empty-message">{t("no_transactions")}</p>
      ) : (
        <div className="transaction-list-wrapper">
          {transactions.map((t: Transaction) => (
            <div key={t.id} className="transaction-card">
              <span className="transaction-date">{formatDate(t.data)}:</span>
              <span className={`transaction-amount ${t.tipo.toLowerCase()}`}>
                {t.tipo === "USCITA" ? "-" : "+"}€
                {t.importo.toLocaleString("it-IT")}
              </span>
              <span className="transaction-desc">{t.descrizione}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
