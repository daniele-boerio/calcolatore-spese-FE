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
import { Sidebar } from "primereact/sidebar";
import Dropdown from "../../../components/dropdown/dropdown";
import Calendar from "../../../components/calendar/calendar";
import {
  selectTransactionFilters,
  updateFilters,
  resetFilters,
} from "../../../features/transactions/transaction_slice";

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
  const filters = useAppSelector(selectTransactionFilters);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(12);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );
  const [isTransactionDialogVisible, setIsTransactionDialogVisible] =
    useState<boolean>(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);

  const toLocalDateStr = (date: Date | null) => {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  };

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
  }, [dispatch, currentPage, pageSize, filters]);

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
  const getSubCatName = (id: string) =>
    sottocategorie.find(
      (c: SottoCategoria | undefined) => c && String(c.id) === String(id),
    )?.nome || "";
  const getTagName = (id: string) =>
    tags.find((t: Tag) => String(t.id) === String(id))?.nome || "";
  const getContoName = (id: string) =>
    conti.find((c: Conto) => String(c.id) === String(id))?.nome || "";

  return (
    <>
      <div className="transaction-page">
        <header
          className="page-header"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
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
                {t("expenses")}:{" "}
                <span>{pagination?.total_expenses || 0} €</span>
              </h3>
            </div>
          </div>
          <div className="header-actions">
            <Button
              icon="pi pi-filter"
              className="trasparent-button"
              onClick={() => setIsSidebarVisible(true)}
              compact
              rounded
            />
            <Button
              label={t("reset_filters")}
              className="trasparent-button"
              onClick={() => {
                dispatch(resetFilters());
                setCurrentPage(0);
              }}
              icon="pi pi-filter-slash"
            />
          </div>
        </header>

        <div className="split-wrapper">
          <section className="transaction-list">
            <div className="scrollable-area">
              <div className="transactions-grid">
                {loading ? (
                  <p className="no-data">{t("loading_data")}</p>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => {
                    const catName = getCatName(transaction.categoria_id);
                    const subCatName = getSubCatName(
                      transaction.sottocategoria_id,
                    );
                    const tagName = getTagName(transaction.tag_id);

                    return (
                      <div
                        key={transaction.id}
                        className={`transaction-card ${transaction.tipo.toLowerCase()}`}
                        onClick={() => onRowClick(transaction)}
                      >
                        <div className="icon-wrapper">
                          <i
                            className={`pi ${transaction.tipo === "USCITA" ? "pi-arrow-down-right" : transaction.tipo === "ENTRATA" ? "pi-arrow-up-right" : "pi-sync"}`}
                          ></i>
                        </div>

                        <div className="card-content">
                          {/* TOP: Descrizione e Cestino */}
                          <div className="card-top">
                            <span className="desc">
                              {transaction.descrizione ||
                                catName ||
                                t("transaction")}
                            </span>
                            <Button
                              className="trasparent-danger-button delete-btn"
                              icon="pi pi-trash"
                              compact
                              onClick={(e: any) => {
                                e.stopPropagation();
                                deleteObject(e, transaction.id);
                              }}
                            />
                          </div>

                          {/* MIDDLE: Categoria, Sottocategoria, Tag */}
                          {(catName || subCatName || tagName) && (
                            <div className="card-middle">
                              {catName && (
                                <span className="info-badge cat">
                                  {catName}
                                </span>
                              )}
                              {subCatName && (
                                <span className="info-badge subcat">
                                  {subCatName}
                                </span>
                              )}
                              {tagName && (
                                <span className="info-badge tag">
                                  <i
                                    className="pi pi-hashtag"
                                    style={{
                                      fontSize: "0.6rem",
                                      marginRight: "2px",
                                    }}
                                  ></i>
                                  {tagName}
                                </span>
                              )}
                            </div>
                          )}

                          {/* BOTTOM: Data/Conto e Importo */}
                          <div className="card-bottom">
                            <span className="date-cat">
                              {new Date(transaction.data).toLocaleDateString(
                                "it-IT",
                                {
                                  day: "2-digit",
                                  month: "short",
                                },
                              )}
                              {getContoName(transaction.conto_id)
                                ? ` • ${getContoName(transaction.conto_id)}`
                                : ""}
                            </span>
                            <span className="amount">
                              {transaction.tipo === "USCITA" ? "-" : "+"}
                              {transaction.importo.toLocaleString("it-IT", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              €
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
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

      <Sidebar
        visible={isSidebarVisible}
        position="right"
        onHide={() => setIsSidebarVisible(false)}
        className="filter-sidebar"
      >
        <h2>{t("filters")}</h2>

        <div className="filter-form">
          <div className="field">
            <Dropdown
              label={t("select_type") || "Seleziona Tipo"}
              value={filters.tipo || null}
              options={[
                { label: t("income"), value: "ENTRATA" },
                { label: t("expenses"), value: "USCITA" },
                { label: t("compensation"), value: "RIMBORSO" },
              ]}
              onChange={(e) => {
                dispatch(updateFilters({ tipo: e.value ?? undefined }));
                setCurrentPage(0);
              }}
              placeholder={t("select_type")}
              showClear
            />
          </div>

          <div className="field">
            <Dropdown
              label={t("bank_account")}
              value={filters.conto_id || null}
              options={conti}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => {
                dispatch(updateFilters({ conto_id: e.value ?? undefined }));
                setCurrentPage(0);
              }}
              placeholder={t("bank_account")}
              showClear
            />
          </div>

          <div className="field">
            <Dropdown
              label={t("category")}
              value={filters.categoria_id || null}
              options={categorie}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => {
                dispatch(
                  updateFilters({
                    categoria_id: e.value ?? undefined,
                    sottocategoria_id: undefined, // Reset subcategory when category changes
                  }),
                );
                setCurrentPage(0);
              }}
              placeholder={t("category")}
              showClear
            />
          </div>

          <div className="field">
            <Dropdown
              label={t("sub_category")}
              value={filters.sottocategoria_id || null}
              options={
                categorie.find((c) => c.id === filters.categoria_id)
                  ?.sottocategorie || []
              }
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => {
                dispatch(
                  updateFilters({ sottocategoria_id: e.value ?? undefined }),
                );
                setCurrentPage(0);
              }}
              placeholder={t("sub_category")}
              disabled={!filters.categoria_id}
              showClear
            />
          </div>

          <div className="field">
            <Dropdown
              label={t("tag")}
              value={filters.tag_id || null}
              options={tags}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => {
                dispatch(updateFilters({ tag_id: e.value ?? undefined }));
                setCurrentPage(0);
              }}
              placeholder={t("tag")}
              showClear
            />
          </div>

          <div className="field">
            <Calendar
              label={t("from_date") || "Da Data"}
              value={parseDate(filters.data_inizio)}
              onChange={(e) => {
                const dateStr = toLocalDateStr(e.value as Date | null);
                dispatch(updateFilters({ data_inizio: dateStr }));
                setCurrentPage(0);
              }}
              showIcon
              showButtonBar
            />
          </div>

          <div className="field">
            <Calendar
              label={t("to_date") || "A Data"}
              value={parseDate(filters.data_fine)}
              onChange={(e) => {
                const dateStr = toLocalDateStr(e.value as Date | null);
                dispatch(updateFilters({ data_fine: dateStr }));
                setCurrentPage(0);
              }}
              showIcon
              showButtonBar
            />
          </div>
        </div>
      </Sidebar>
    </>
  );
}
