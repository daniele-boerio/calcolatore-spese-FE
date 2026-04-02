import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  getCategorie,
  deleteCategoria,
} from "../../features/categorie/api_calls";
import "./category_page.scss";
import Button from "../../components/button/button";
import CustomCard from "../../components/custom_card/custom_card";
import { Categoria } from "../../features/categorie/interfaces";
import { confirmPopup } from "primereact/confirmpopup";
import { useI18n } from "../../i18n/use-i18n";
import CategoryDialog from "../../components/dialog/category_dialog/category_dialog";
import MigrateTransactionsDialog from "../../components/dialog/migrate_transactions_dialog/migrate_transactions_dialog";
import {
  selectCategoriaCategorie,
  selectCategoriaLoading,
} from "../../features/categorie/categoria_slice";

export default function CategoryPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const categorie = useAppSelector(selectCategoriaCategorie);
  const CatLoading = useAppSelector(selectCategoriaLoading);

  const [isDialogCatVisible, setIsDialogCatVisible] = useState(false);
  const [isMigrateDialogVisible, setIsMigrateDialogVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(
    null,
  );

  // --- NUOVO STATO PER LE SEZIONI COLLASSABILI ---
  // Di default le teniamo tutte aperte (true)
  const [expandedSections, setExpandedSections] = useState({
    incomes: false,
    expenses: false,
    others: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    dispatch(getCategorie());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setIsDialogCatVisible(true);
  };

  const handleOpenCatEdit = (cat: Categoria) => {
    setSelectedCategory(cat);
    setIsDialogCatVisible(true);
  };

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
        dispatch(deleteCategoria({ id }));
      },
      reject: () => {},
    });
  };

  // --- LOGICA DI FILTRAGGIO DELLE CATEGORIE ---
  const incomesCategories = categorie.filter(
    (cat) => cat.solo_entrata && !cat.solo_uscita,
  );

  const expensesCategories = categorie.filter(
    (cat) => cat.solo_uscita && !cat.solo_entrata,
  );

  const othersCategories = categorie.filter(
    (cat) =>
      (cat.solo_entrata && cat.solo_uscita) ||
      (!cat.solo_entrata && !cat.solo_uscita),
  );

  // --- HELPER PER IL RENDER DELLA CARD ---
  const renderCategoryCard = (cat: Categoria) => (
    <CustomCard
      key={cat.id}
      title={cat.nome}
      // Trasformiamo le sottocategorie del Redux store nel formato richiesto dalla card
      sottocategorie={cat.sottocategorie?.map((sub) => ({
        sottocategoria: sub.nome,
      }))}
      // Passiamo i bottoni come ReactNode
      actions={
        <div className="buttons" style={{ display: "flex", gap: "0.25rem" }}>
          <Button
            className="trasparent-button"
            icon="pi pi-pencil"
            compact
            onClick={() => handleOpenCatEdit(cat)}
          />
          <Button
            className="trasparent-danger-button"
            icon="pi pi-trash"
            compact
            onClick={(e: any) => deleteObject(e, cat.id)}
          />
        </div>
      }
    />
  );

  return (
    <>
      <div className="categorie-page">
        <div
          className="page-header"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <h1>
            <i
              className="pi pi-tags"
              style={{ fontSize: "1.5rem", marginRight: "0.625rem" }}
            ></i>
            {t("category_title")}
          </h1>
          <Button
            className="action-button"
            label={t("migrate_transactions")}
            icon="pi pi-arrow-right-arrow-left"
            onClick={() => setIsMigrateDialogVisible(true)}
            compact
          />
        </div>

        {/* --- CONTENITORE PRINCIPALE --- */}
        <div className="split-wrapper">
          <section className="category-list">
            <div className="scrollable-area">
              {/* --- SEZIONE ENTRATE --- */}
              <div className="category-section">
                <h3
                  onClick={() => toggleSection("incomes")}
                  className="section-title"
                >
                  <i
                    className={`pi ${expandedSections.incomes ? "pi-chevron-down" : "pi-chevron-right"}`}
                  ></i>
                  {t("income")}
                </h3>
                {/* Mostra la griglia solo se la sezione è espansa */}
                {expandedSections.incomes && (
                  <div className="categories-grid">
                    {incomesCategories.length > 0 ? (
                      incomesCategories.map(renderCategoryCard)
                    ) : (
                      <p className="no-data">{t("no_data")}</p>
                    )}
                  </div>
                )}
              </div>

              {/* --- SEZIONE USCITE --- */}
              <div className="category-section">
                <h3
                  onClick={() => toggleSection("expenses")}
                  className="section-title"
                >
                  <i
                    className={`pi ${expandedSections.expenses ? "pi-chevron-down" : "pi-chevron-right"}`}
                  ></i>
                  {t("expenses")}
                </h3>
                {expandedSections.expenses && (
                  <div className="categories-grid">
                    {expensesCategories.length > 0 ? (
                      expensesCategories.map(renderCategoryCard)
                    ) : (
                      <p className="no-data">{t("no_data")}</p>
                    )}
                  </div>
                )}
              </div>

              {/* --- SEZIONE MISTE (ALTRO) --- */}
              <div className="category-section">
                <h3
                  onClick={() => toggleSection("others")}
                  className="section-title"
                >
                  <i
                    className={`pi ${expandedSections.others ? "pi-chevron-down" : "pi-chevron-right"}`}
                  ></i>
                  {t("others")}
                </h3>
                {expandedSections.others && (
                  <div className="categories-grid">
                    {othersCategories.length > 0 ? (
                      othersCategories.map(renderCategoryCard)
                    ) : (
                      <p className="no-data">{t("no_data")}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <Button
          icon="pi pi-plus"
          className="add-category-button"
          compact
          rounded
          onClick={handleOpenCreate}
        />

        <CategoryDialog
          visible={isDialogCatVisible}
          category={selectedCategory!}
          onHide={() => setIsDialogCatVisible(false)}
          loading={CatLoading}
        />

        <MigrateTransactionsDialog
          visible={isMigrateDialogVisible}
          onHide={() => setIsMigrateDialogVisible(false)}
        />
      </div>
    </>
  );
}
