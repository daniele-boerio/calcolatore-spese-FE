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
import { selectContiConti } from "../../../features/conti/conto_slice";
import {
  selectTransactionLoading,
  selectTransactionPagination,
  selectTransactionTransactions,
} from "../../../features/transactions/transaction_slice";
import {
  selectCategoriaCategorie,
  selectCategoriaSottocategorie,
} from "../../../features/categorie/categoria_slice";
import { getCategorie } from "../../../features/categorie/api_calls";
import {
  Categoria,
  SottoCategoria,
} from "../../../features/categorie/interfaces";
import { selectTagTags } from "../../../features/tags/tag_slice";
import { getTags } from "../../../features/tags/api_calls";
import { Tag } from "../../../features/tags/interfaces";

export default function Transactions() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Utilizziamo lo stato tipizzato 'transactions'
  const transactions = useAppSelector(selectTransactionTransactions);
  const loading = useAppSelector(selectTransactionLoading);
  const pagination = useAppSelector(selectTransactionPagination);
  const conti = useAppSelector(selectContiConti);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const sottocategorie = useAppSelector(selectCategoriaSottocategorie);
  const tags = useAppSelector(selectTagTags);

  const [currentPage, setCurrentPage] = useState<number>(0);
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
    const fetchReferenceData = async () => {
      try {
        await Promise.all([
          dispatch(getConti()).unwrap(),
          dispatch(getCategorie()).unwrap(),
          dispatch(getTags()).unwrap(),
        ]);
      } catch (error) {
        console.error("Errore nel caricamento dei dati di riferimento", error);
      }
    };
    fetchReferenceData();
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getTransactionsPaginated({
        page: currentPage + 1,
        size: pageSize,
      }),
    );
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
          return conto ? conto.nome : ``;
        },
      },
      {
        field: "categoria_id",
        header: "Categoria",
        body: (row: any) => {
          // Ora questa logica viene ricalcolata non appena 'categoria' si popola
          const categoria = categorie.find(
            (c: Categoria) => String(c.id) === String(row.categoria_id),
          );
          return categoria ? categoria.nome : ``;
        },
      },
      {
        field: "sottocategoria_id",
        header: "Sottocategoria",
        body: (row: any) => {
          // Ora questa logica viene ricalcolata non appena 'sottocategorie' si popola
          const sottocategoria = sottocategorie.find(
            (c: SottoCategoria | undefined) =>
              c && String(c.id) === String(row.sottocategoria_id),
          );
          return sottocategoria ? sottocategoria.nome : ``;
        },
      },
      {
        field: "tag_id",
        header: "Tag",
        body: (row: any) => {
          // Ora questa logica viene ricalcolata non appena 'tags' si popola
          const tag = tags.find(
            (tag: Tag) => String(tag.id) === String(row.tag_id),
          );
          return tag ? tag.nome : ``;
        },
      },
      {
        field: "delete",
        header: t("actions"),
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
    [conti, categorie, sottocategorie, tags, t],
  );

  const dataReadyKey = useMemo(() => {
    return `table-${conti.length > 0}-${categorie.length > 0}-${tags.length > 0}`;
  }, [conti.length, categorie.length, tags.length]);

  return (
    <>
      <div className="transaction-page">
        <header className="page-header">
          <h1>{t("transaction_history")}</h1>
          <div className="stats">
            <h3 className="stats-item">
              {t("income")}: {pagination?.total_incomes || 0} €
            </h3>
            <h3 className="stats-item">
              {t("expenses")}: {pagination?.total_expenses || 0} €
            </h3>
            <h3 className="stats-item">
              {t("total_transactions")}: {pagination?.total || 0}
            </h3>
          </div>
        </header>

        <TableVisualization
          className="transaction-table"
          key={dataReadyKey}
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
