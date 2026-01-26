import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getTransactionsPaginated } from "../../features/transactions/apiCalls";
import { getConti } from "../../features/conti/apiCalls";
import TableVisualization, {
  VisualizationColumnProps,
} from "../../components/TableVisualization/TableVisualization";
import "./TransactionPage.scss";
import { Transaction } from "../../features/transactions/interfaces";

// Definiamo l'interfaccia per la struttura delle colonne
interface TableColumn {
  field: string;
  header: string;
  body?: (row: Transaction) => React.ReactNode;
}

function TransactionPage() {
  const dispatch = useAppDispatch();

  // Utilizziamo lo stato tipizzato 'transactions'
  const { transactions, loading, pagination } = useAppSelector(
    (state) => state.transaction,
  );
  const conti = useAppSelector((state) => state.conto.conti);

  const [currentPage, setCurrentPage] = useState<number>(0); // PrimeReact parte da 0
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    // Il backend si aspetta la pagina (base 1)
    dispatch(
      getTransactionsPaginated({ page: currentPage + 1, size: pageSize }),
    );
    dispatch(getConti());
  }, [dispatch, currentPage, pageSize]);

  const columns: VisualizationColumnProps[] = [
    {
      field: "data",
      header: "Data",
      body: (row) =>
        new Date(row.data).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      field: "tipo",
      header: "Tipo",
      body: (row) => (
        <span className={`badge-${row.tipo.toLowerCase()}`}>
          {row.tipo.toUpperCase()}
        </span>
      ),
    },
    {
      field: "importo",
      header: "Importo",
      body: (row) => (
        <span
          style={{
            fontWeight: "bold",
            color:
              row.tipo.toUpperCase() === "USCITA"
                ? "var(--red-500)"
                : "var(--green-500)",
          }}
        >
          {row.tipo.toUpperCase() === "USCITA" ? "-" : "+"} €
          {row.importo.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    { field: "descrizione", header: "Descrizione" },
    {
      field: "conto_id",
      header: "Conto",
      body: (row) =>
        conti.find((c) => c.id === row.conto_id)?.nome || `ID: ${row.conto_id}`,
    },
  ];

  return (
    <div className="transaction-page">
      <header className="page-header">
        <h1>Storico Transazioni</h1>
        <div className="stats">Totale: {pagination?.total || 0}</div>
      </header>

      <TableVisualization
        value={transactions}
        columns={columns}
        className="mt-4"
        paginator={{
          row: pageSize,
          totalRecords: pagination?.total || 0,
          first: currentPage * pageSize,
          loading: loading,
          lazy: true,
          onPage: (e: { page: number; rows: number }) => {
            setCurrentPage(e.page);
            setPageSize(e.rows);
          },
        }}
      />
    </div>
  );
}

export default TransactionPage;
