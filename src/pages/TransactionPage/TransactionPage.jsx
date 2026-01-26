import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getTransactionsPaginated } from "../../features/transactions/apiCalls";
import { getConti } from "../../features/conti/apiCalls";
import TableVisualization from "../../components/TableVisualization/TableVisualization";
import "./TransactionPage.scss";

function TransactionPage() {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector(
    (state) => state.transaction.transactions,
  );
  const loading = useAppSelector((state) => state.transaction.loading);
  const pagination = useAppSelector((state) => state.transaction.pagination);
  const conti = useAppSelector((state) => state.conto.conti); // Assumo che lo store dei conti sia così

  const [currentPage, setCurrentPage] = useState(0); // PrimeReact parte da 0
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // Il backend si aspetta la pagina. Se il backend usa base 1, invia currentPage + 1
    dispatch(
      getTransactionsPaginated({ page: currentPage + 1, size: pageSize }),
    );
    dispatch(getConti());
  }, [dispatch, currentPage, pageSize]);

  const columns = [
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
        <span className={`badge-${row.tipo.toLowerCase()}`}>{row.tipo}</span>
      ),
    },
    {
      field: "importo",
      header: "Importo",
      body: (row) => (
        <span
          style={{
            fontWeight: "bold",
            color: row.tipo === "USCITA" ? "red" : "green",
          }}
        >
          {row.tipo === "USCITA" ? "-" : "+"} €{row.importo.toFixed(2)}
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
    {
      field: "tag",
      header: "Tag",
      body: (row) => row.tag?.nome || "-", // Usiamo l'oggetto tag completo se presente
    },
  ];

  return (
    <div className="transaction-page">
      <header className="page-header">
        <h1>Storico Transazioni</h1>
        <div className="stats">Totale: {pagination?.total || 0}</div>
      </header>

      <TableVisualization
        value={transactions} // value, non data (come da props definite)
        columns={columns}
        className="mt-4"
        paginator={{
          row: pageSize,
          totalRecords: pagination?.total || 0,
          first: currentPage * pageSize,
          loading: loading,
          lazy: true,
          onPage: (e) => {
            setCurrentPage(e.page);
            setPageSize(e.rows);
          },
        }}
      />
    </div>
  );
}

export default TransactionPage;
