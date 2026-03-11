import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  deleteTransaction,
  getTransactionsPaginated,
} from "../../../features/transactions/api_calls";
import { getConti } from "../../../features/conti/api_calls";
import "./transactions.scss";
import { Conto } from "../../../features/conti/interfaces";
import Button from "../../../components/button/button";
import { confirmPopup } from "primereact/confirmpopup";
import { useI18n } from "../../../i18n/use-i18n";
import TransactionDialog from "../../../components/dialog/transaction_dialog/transaction_dialog";
import { selectContiConti } from "../../../features/conti/conto_slice";
import { Paginator } from "primereact/paginator"; // Importiamo il Paginator nudo e crudo
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
      await Promise.all([
        dispatch(getConti()).unwrap(),
        dispatch(getCategorie()).unwrap(),
        dispatch(getTags()).unwrap(),
      ]);
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

  const deleteObject = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
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

  // Helper per trovare i nomi (così non appesantiamo il JSX)
  const getCatName = (id: string) =>
    categorie.find((c: Categoria) => String(c.id) === String(id))?.nome || "";
  const getContoName = (id: string) =>
    conti.find((c: Conto) => String(c.id) === String(id))?.nome || "";

  return (
    <>
      <div className="transaction-page">
        <header className="page-header">
          <h1>{t("transaction_history")}</h1>
          <div className="stats">
            <h3 className="stats-item income">
              {t("income")}: <span>{pagination?.total_incomes || 0} €</span>
            </h3>
            <h3 className="stats-item compensation">
              {t("compensations")}:{" "}
              <span>{pagination?.total_compensation || 0} €</span>
            </h3>
            <h3 className="stats-item expenses">
              {t("expenses")}: <span>{pagination?.total_expenses || 0} €</span>
            </h3>
          </div>
        </header>

        <div className="split-wrapper">
          <section className="transaction-list">
            <div className="scrollable-area">
              <div className="transactions-grid">
                {loading ? (
                  <p className="no-data">Caricamento in corso...</p>
                ) : transactions.length > 0 ? (
                  transactions.map((t) => (
                    <div
                      key={t.id}
                      className={`transaction-card ${t.tipo.toLowerCase()}`}
                      onClick={() => onRowClick(t)}
                    >
                      {/* Icona sempre a sinistra */}
                      <div className="icon-wrapper">
                        <i
                          className={`pi ${t.tipo === "USCITA" ? "pi-arrow-down-right" : t.tipo === "ENTRATA" ? "pi-arrow-up-right" : "pi-sync"}`}
                        ></i>
                      </div>

                      {/* Contenitore principale a destra */}
                      <div className="card-content">
                        {/* Prima riga: Descrizione e Azioni */}
                        <div className="card-top">
                          <span className="desc">
                            {t.descrizione ||
                              getCatName(t.categoria_id) ||
                              "Transazione"}
                          </span>
                          <Button
                            className="trasparent-danger-button delete-btn"
                            icon="pi pi-trash"
                            compact
                            onClick={(e: any) => {
                              e.stopPropagation();
                              deleteObject(e, t.id);
                            }}
                          />
                        </div>

                        {/* Seconda riga: Data/Conto e Importo */}
                        <div className="card-bottom">
                          <span className="date-cat">
                            {new Date(t.data).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "short",
                            })}
                            {getContoName(t.conto_id)
                              ? ` • ${getContoName(t.conto_id)}`
                              : ""}
                          </span>
                          <span className="amount">
                            {t.tipo === "USCITA" ? "-" : "+"}
                            {t.importo.toLocaleString("it-IT", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            €
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">{t("no_data")}</p>
                )}
              </div>

              {/* Paginazione a fondo lista */}
              {pagination && (pagination.total || 0) > pageSize && (
                <Paginator
                  first={currentPage * pageSize}
                  rows={pageSize}
                  totalRecords={pagination?.total || 0}
                  onPageChange={(e: any) => {
                    setCurrentPage(e.page);
                    setPageSize(e.rows);
                  }}
                />
              )}
            </div>
          </section>
        </div>

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
