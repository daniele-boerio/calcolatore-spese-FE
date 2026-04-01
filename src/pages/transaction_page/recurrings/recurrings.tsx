import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import "./recurrings.scss";
import { Conto } from "../../../features/conti/interfaces";
import Button from "../../../components/button/button";
import { confirmPopup } from "primereact/confirmpopup";
import { useI18n } from "../../../i18n/use-i18n";
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
import { getTags } from "../../../features/tags/api_calls";
import { getConti } from "../../../features/conti/api_calls";

export default function Recurrings() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const recurrings = useAppSelector(selectRecurringRecurrings);
  const loading = useAppSelector(selectRecurringLoading);
  const conti = useAppSelector(selectContiConti);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const sottocategorie = useAppSelector(selectCategoriaSottocategorie);
  const tags = useAppSelector(selectTagTags);

  const [selectedRecurring, setSelectedRecurring] = useState<any | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

  const onRowClick = (recurring: any) => {
    setSelectedRecurring(recurring);
    setIsDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setIsDialogVisible(false);
    setSelectedRecurring(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        dispatch(getConti()),
        dispatch(getRecurrings()),
        dispatch(getCategorie()),
        dispatch(getTags()),
      ]);
    };
    fetchData();
  }, [dispatch]);

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
        dispatch(deleteRecurring({ id }));
      },
      reject: () => {},
    });
  };

  // Helper per trovare i nomi
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
      <div className="transaction-page-recurring">
        {/* HEADER */}
        <header className="page-header">
          <h1>{t("recurring_history")}</h1>
          <div className="stats">
            <h3 className="stats-item">
              {t("total_transactions")}: <span>{recurrings.length}</span>
            </h3>
          </div>
        </header>

        {/* CONTAINER GRIGLIA */}
        <div className="split-wrapper">
          <section className="transaction-list">
            <div className="scrollable-area">
              <div className="transactions-grid">
                {loading ? (
                  <p className="no-data">{t("loading_data")}</p>
                ) : recurrings.length > 0 ? (
                  recurrings.map((r) => {
                    const catName = getCatName(r.categoria_id);
                    const subCatName = getSubCatName(r.sottocategoria_id);
                    const tagName = getTagName(r.tag_id);
                    const isInactive = !r.attiva;

                    return (
                      <div
                        key={r.id}
                        className={`transaction-card ${r.tipo.toLowerCase()} ${isInactive ? "inactive" : ""}`}
                        onClick={() => onRowClick(r)}
                      >
                        <div className="icon-wrapper">
                          <i
                            className={`pi ${r.tipo === "USCITA" ? "pi-arrow-down-right" : r.tipo === "ENTRATA" ? "pi-arrow-up-right" : "pi-sync"}`}
                          ></i>
                        </div>

                        <div className="card-content">
                          {/* TOP: Nome, Stato e Cestino */}
                          <div className="card-top">
                            <div className="desc-container">
                              <span className="desc">
                                {r.nome || catName || t("recurring_item")}
                              </span>
                              {isInactive && (
                                <span className="status-badge suspended">
                                  {t("status_suspended")}
                                </span>
                              )}
                            </div>
                            <Button
                              className="trasparent-danger-button delete-btn"
                              icon="pi pi-trash"
                              compact
                              onClick={(e: any) => {
                                e.stopPropagation();
                                deleteObject(e, r.id);
                              }}
                            />
                          </div>

                          {/* MIDDLE: Frequenza, Categoria, Sottocategoria, Tag */}
                          <div className="card-middle">
                            <span className="info-badge frequency">
                              <i
                                className="pi pi-calendar-clock"
                                style={{
                                  fontSize: "0.6rem",
                                  marginRight: "4px",
                                }}
                              ></i>
                              {r.frequenza}
                            </span>
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

                          {/* BOTTOM: Prossima Esecuzione/Conto e Importo */}
                          <div className="card-bottom">
                            <span className="date-cat">
                              {r.prossima_esecuzione
                                ? `${t("prox_execution")} ${new Date(r.prossima_esecuzione).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}`
                                : ""}
                              {getContoName(r.conto_id)
                                ? ` • ${getContoName(r.conto_id)}`
                                : ""}
                            </span>
                            <span className="amount">
                              {r.tipo === "USCITA" ? "-" : "+"}
                              {r.importo.toLocaleString("it-IT", {
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
            </div>
          </section>
        </div>

        {/* FAB BUTTON */}
        <Button
          className="add-transaction-button"
          icon={"pi pi-plus"}
          compact
          rounded
          onClick={() => setIsDialogVisible(true)}
        />
      </div>

      <RecurrenceDialog
        visible={isDialogVisible}
        recurring={selectedRecurring}
        onHide={() => handleCloseDialog()}
      />
    </>
  );
}
