import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Paginator } from "primereact/paginator";
import { useAppSelector } from "../../../store/store";
import { useI18n } from "../../../i18n/use-i18n";
import api from "../../../services/api";
import {
  selectCategoriaCategorie,
  selectCategoriaSottocategorie,
} from "../../../features/categorie/categoria_slice";
import { selectTagTags } from "../../../features/tags/tag_slice";
import { selectContiConti } from "../../../features/conti/conto_slice";
import { Transaction } from "../../../features/transactions/interfaces";
import {
  Categoria,
  SottoCategoria,
} from "../../../features/categorie/interfaces";
import { Tag } from "../../../features/tags/interfaces";
import { Conto } from "../../../features/conti/interfaces";
import "./transactions_list_dialog.scss";

export interface TransactionsListDialogProps {
  visible: boolean;
  onHide: () => void;
  title: string;
  filters: {
    categoria_id?: string;
    sottocategoria_id?: string;
    data_inizio?: string;
    data_fine?: string;
  };
}

export default function TransactionsListDialog({
  visible,
  onHide,
  title,
  filters,
}: TransactionsListDialogProps) {
  const { t } = useI18n();

  const categorie = useAppSelector(selectCategoriaCategorie);
  const sottocategorie = useAppSelector(selectCategoriaSottocategorie);
  const tags = useAppSelector(selectTagTags);
  const conti = useAppSelector(selectContiConti);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 10;

  useEffect(() => {
    if (visible) {
      setCurrentPage(0);
      fetchData(0);
    } else {
      setTransactions([]);
      setTotalRecords(0);
    }
  }, [visible, filters]);

  const fetchData = async (pageIndex: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", (pageIndex + 1).toString());
      params.append("size", pageSize.toString());

      if (filters.categoria_id)
        params.append("categoria_id", filters.categoria_id);
      if (filters.sottocategoria_id)
        params.append("sottocategoria_id", filters.sottocategoria_id);
      if (filters.data_inizio)
        params.append("data_inizio", filters.data_inizio);
      if (filters.data_fine) params.append("data_fine", filters.data_fine);

      const response = await api.get(
        `/transazioni/paginated?${params.toString()}`,
      );

      const mapped = response.data.data.map((tx: any) => ({
        ...tx,
        importo: Number(tx.importo),
        importo_netto:
          tx.importo_netto !== null ? Number(tx.importo_netto) : null,
      }));

      setTransactions(mapped);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event: any) => {
    setCurrentPage(event.page);
    fetchData(event.page);
  };

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
    <Dialog
      className="dialog-custom transactions-list-dialog"
      header={title}
      visible={visible}
      onHide={onHide}
      style={{ width: "95vw", maxWidth: "45rem" }}
      dismissableMask
      blockScroll={true}
      draggable={false}
      resizable={false}
    >
      <div className="dialog-content">
        {loading ? (
          <p className="no-data">{t("loading_data")}</p>
        ) : transactions.length > 0 ? (
          <div className="transactions-grid-dialog">
            {transactions.map((transaction) => {
              const catName = getCatName(transaction.categoria_id);
              const subCatName = getSubCatName(transaction.sottocategoria_id);
              const tagName = getTagName(transaction.tag_id);

              return (
                <div
                  key={transaction.id}
                  className={`transaction-card ${transaction.tipo.toLowerCase()}`}
                >
                  <div className="icon-wrapper">
                    <i
                      className={`pi ${
                        transaction.tipo === "USCITA"
                          ? "pi-arrow-down-right"
                          : transaction.tipo === "ENTRATA"
                            ? "pi-arrow-up-right"
                            : "pi-sync"
                      }`}
                    ></i>
                  </div>

                  <div className="card-content">
                    <div className="card-top">
                      <span className="desc">
                        {transaction.descrizione || catName || t("transaction")}
                      </span>
                    </div>

                    {(catName || subCatName || tagName) && (
                      <div className="card-middle">
                        {catName && (
                          <span className="info-badge cat">{catName}</span>
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
            })}
          </div>
        ) : (
          <p className="no-data">{t("no_transactions_found_filters")}</p>
        )}

        {totalRecords > pageSize && (
          <Paginator
            first={currentPage * pageSize}
            rows={pageSize}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </Dialog>
  );
}
