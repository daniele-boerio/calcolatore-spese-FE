import React, { useEffect } from "react";
import "./TransactionList.scss";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { getLastTransactions } from "../../features/transactions/apiCalls";
import { Transaction } from "../../features/transactions/interfaces";

interface TransactionListProps {
  num: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ num }) => {
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
      <h3 className="transaction-list-title">Ultime Transazioni:</h3>

      {loading ? (
        <div className="loading-spinner">
          <i
            className="pi pi-spin pi-spinner"
            style={{ marginRight: "10px" }}
          ></i>
          Caricamento...
        </div>
      ) : transactions.length === 0 ? (
        <p className="empty-message">Nessuna transazione trovata.</p>
      ) : (
        <div className="transaction-list-wrapper">
          {transactions.map((t: Transaction) => (
            <div key={t.id} className="transaction-card">
              <span className="transaction-date">{formatDate(t.data)}:</span>
              <span className={`transaction-amount ${t.tipo.toLowerCase()}`}>
                {t.tipo === "uscita" ? "-" : "+"}€
                {t.importo.toLocaleString("it-IT")}
              </span>
              <span className="transaction-desc">{t.descrizione}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
