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
import "./recurrings.scss";
import { Conto } from "../../../features/conti/interfaces";
import Button from "../../../components/button/button";
import { confirmPopup } from "primereact/confirmpopup";
import { useI18n } from "../../../i18n/use-i18n";
import TransactionDialog from "../../../components/dialog/transaction_dialog/transaction_dialog";
import {
  selectRecurringLoading,
  selectRecurringRecurrings,
} from "../../../features/recurrings/recurring_slice";
import { selectContiConti } from "../../../features/conti/conto_slice";
import {
  selectCategoriaCategorie,
  selectCategoriaSottocategorie,
} from "../../../features/categorie/categoria_slice";
import {
  deleteRecurring,
  getRecurrings,
} from "../../../features/recurrings/api_calls";
import { getCategorie } from "../../../features/categorie/api_calls";
import {
  Categoria,
  SottoCategoria,
} from "../../../features/categorie/interfaces";
import { Tag } from "../../../features/tags/interfaces";
import { selectTagTags } from "../../../features/tags/tag_slice";
import RecurrenceDialog from "../../../components/dialog/recurrence_dialog/recurrence_dialog";

export default function Recurrings() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Utilizziamo lo stato tipizzato 'transactions'
  const recurrings = useAppSelector(selectRecurringRecurrings);
  const loading = useAppSelector(selectRecurringLoading);
  const conti = useAppSelector(selectContiConti);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const sottocategorie = useAppSelector(selectCategoriaSottocategorie);
  const tags = useAppSelector(selectTagTags);

  const [selectedRecurring, setselectedRecurring] = useState<any | null>(null);

  const [isTransactionDialogVisible, setIsTransactionDialogVisible] =
    useState<boolean>(false);

  const onRowClick = (recurring: any) => {
    setselectedRecurring(recurring);
    setIsTransactionDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setIsTransactionDialogVisible(false);
    setselectedRecurring(null);
  };

  useEffect(() => {
    // Dispatch simultaneo per garantire che le chiamate partano subito
    const fetchData = async () => {
      await Promise.all([
        dispatch(getConti()),
        dispatch(getRecurrings()),
        dispatch(getCategorie()),
      ]);
    };
    fetchData();
  }, [dispatch]);

  const deleteObject = (event: any, id: string) => {
    confirmPopup({
      target: event.currentTarget,
      message: t("delete_message"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: t("yes"),
      rejectLabel: t("no"),
      accept: () => {
        dispatch(deleteRecurring({ id }));
      },
      reject: () => {},
    });
  };

  const columns: VisualizationColumnProps[] = useMemo(
    () => [
      {
        field: "nome",
        header: "Nome",
        body: (row: any) => (
          <span style={{ fontWeight: "600" }}>{row.nome}</span>
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
      {
        field: "frequenza",
        header: "Frequenza",
        body: (row: any) => (
          <span className="badge-frequenza">{row.frequenza}</span>
        ),
      },
      {
        field: "prossima_esecuzione",
        header: "Prossima Scadenza",
        body: (row: any) =>
          new Date(row.prossima_esecuzione).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
      },
      {
        field: "attiva",
        header: "Stato",
        body: (row: any) => (
          <span
            className={row.attiva ? "status-active" : "status-inactive"}
            style={{
              fontWeight: "bold",
              color: !row.attiva ? "var(--red-500)" : "var(--green-500)",
            }}
          >
            {row.attiva ? "ATTIVA" : "SOSPESA"}
          </span>
        ),
      },
      {
        field: "conto_id",
        header: "Conto",
        body: (row: any) => {
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
            onClick={(e) => {
              e.stopPropagation();
              deleteObject(e, row.id);
            }}
          />
        ),
      },
    ],
    [conti, categorie, t],
  );

  return (
    <>
      <div className="transaction-page">
        <header className="page-header">
          <h1>Transazioni Ricorrenti</h1>
          <div className="stats">Totale: {recurrings.length}</div>
        </header>

        <TableVisualization
          value={recurrings}
          columns={columns}
          selectionRow={{
            selectedRow: selectedRecurring,
            onSelectionChange: (e) => onRowClick(e),
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
      <RecurrenceDialog
        visible={isTransactionDialogVisible}
        recurring={selectedRecurring}
        onHide={() => handleCloseDialog()}
      />
    </>
  );
}
