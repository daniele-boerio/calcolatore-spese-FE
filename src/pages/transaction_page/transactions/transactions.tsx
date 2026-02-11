import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  deleteTransaction,
  getTransactionsPaginated,
} from "../../../features/transactions/api_calls";
import { getConti } from "../../../features/conti/api_calls";
import TableVisualization, {
  VisualizationColumnProps,
} from "../../../components/table_visualization/table_visualization";
import "./transactions.scss";
import { Conto } from "../../../features/conti/interfaces";
import Button from "../../../components/button/button";
import { confirmPopup } from "primereact/confirmpopup";
import { useI18n } from "../../../i18n/use-i18n";
import TransactionDialog from "../../../components/dialog/transaction_dialog/transaction_dialog";

export default function Transactions() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Utilizziamo lo stato tipizzato 'transactions'
  const { transactions, loading, pagination } = useAppSelector(
    (state: any) => state.transaction,
  );
  const conti = useAppSelector((state: any) => state.conto.conti);

  const [currentPage, setCurrentPage] = useState<number>(0); // PrimeReact parte da 0
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );

  const [isTransactionDialogVisible, setIsTransactionDialogVisible] =
    useState<boolean>(false);

  const onRowClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsTransactionDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setIsTransactionDialogVisible(false);
    setSelectedTransaction(null);
  };

  useEffect(() => {
    // Dispatch simultaneo per garantire che le chiamate partano subito
    const fetchData = async () => {
      await Promise.all([
        dispatch(getConti()),
        dispatch(
          getTransactionsPaginated({ page: currentPage + 1, size: pageSize }),
        ),
      ]);
    };
    fetchData();
  }, [dispatch, currentPage, pageSize]);

  const deleteObject = (event: any, id: string) => {
    confirmPopup({
      target: event.currentTarget,
      message: t("delete_message"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: t("yes"),
      rejectLabel: t("no"),
      accept: () => {
        dispatch(deleteTransaction({ id }));
      },
      reject: () => {},
    });
  };

  const columns: VisualizationColumnProps[] = useMemo(
    () => [
      {
        field: "data",
        header: "Data",
        body: (row: any) =>
          new Date(row.data).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
      },
      {
        field: "tipo",
        header: "Tipo",
        body: (row: any) => (
          <span className={`badge-${row.tipo.toLowerCase()}`}>
            {row.tipo.toUpperCase()}
          </span>
        ),
      },
      {
        field: "importo",
        header: "Importo",
        body: (row: any) => (
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
        body: (row: any) => {
          // Ora questa logica viene ricalcolata non appena 'conti' si popola
          const conto = conti.find(
            (c: Conto) => String(c.id) === String(row.conto_id),
          );
          return conto ? conto.nome : `ID: ${row.conto_id}`;
        },
      },
      {
        field: "delete",
        header: "",
        body: (row: any) => (
          <Button
            className="trasparent-danger-button"
            icon="pi pi-trash"
            compact
            onClick={(e) => {
              e.stopPropagation();
              deleteObject(e, row.id);
            }}
          />
        ),
      },
    ],
    [conti, t],
  );

  return (
    <>
      <div className="transaction-page">
        <header className="page-header">
          <h1>Storico Transazioni</h1>
          <div className="stats">Totale: {pagination?.total || 0}</div>
        </header>

        <TableVisualization
          value={transactions}
          columns={columns}
          selectionRow={{
            selectedRow: selectedTransaction,
            onSelectionChange: (e) => onRowClick(e),
          }}
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
        <Button
          className="add-transaction-button"
          icon={"pi pi-plus"}
          compact
          rounded
          onClick={() => setIsTransactionDialogVisible(true)}
        />
      </div>
      <TransactionDialog
        visible={isTransactionDialogVisible}
        transaction={selectedTransaction}
        onHide={() => handleCloseDialog()}
      />
    </>
  );
}
