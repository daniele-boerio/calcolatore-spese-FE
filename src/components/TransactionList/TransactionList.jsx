import "./TransactionList.scss";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { useEffect } from "react";
import { getLastTransactions } from "../../features/transactions/apiCalls";

const TransactionList = ({ num }) => {
  const dispatch = useAppDispatch();
  const { transactions, loading } = useAppSelector(
    (state) => state.transaction
  );

  useEffect(() => {
    dispatch(getLastTransactions(num));
  }, [dispatch, num]);

  // Formattatore per la data (es: 22 Gen 2026)
  const formatDate = (dateString) => {
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
        <div className="loading-spinner">Caricamento...</div>
      ) : transactions.length === 0 ? (
        <p className="empty-message">Nessuna transazione trovata.</p>
      ) : (
        <div className="transaction-list-wrapper">
          {transactions.map((t) => (
            <div key={t.id} className="transaction-card">
              <span className="transaction-date">{formatDate(t.data)}:</span>
              <span className={`transaction-amount ${t.tipo.toLowerCase()}`}>
                {t.tipo === "USCITA" ? "-" : "+"}€{t.importo}
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
