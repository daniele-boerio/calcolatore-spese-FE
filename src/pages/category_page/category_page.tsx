import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  getCategorie,
  deleteCategoria,
} from "../../features/categorie/api_calls";
import "./category_page.scss";
import Button from "../../components/button/button";
import { Categoria } from "../../features/categorie/interfaces";
import { confirmPopup } from "primereact/confirmpopup";
import { useI18n } from "../../i18n/use-i18n";
import CategoryDialog from "../../components/dialog/category_dialog/category_dialog";
import {
  selectCategoriaCategorie,
  selectCategoriaLoading,
} from "../../features/categorie/categoria_slice";

export default function CategoryPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const categorie = useAppSelector(selectCategoriaCategorie);
  const CatLoading = useAppSelector(selectCategoriaLoading);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isDialogCatVisible, setIsDialogCatVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(
    null,
  );

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

  const deleteObject = (event: any, id: string) => {
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

  return (
    <>
      <div className="categorie-page">
        <div className="page-header">
          <h1>
            <i
              className="pi pi-tags"
              style={{ fontSize: "1.5rem", marginRight: "0.625rem" }}
            ></i>
            {t("category_title")}
          </h1>
        </div>

        <div className="split-wrapper">
          {/* SEZIONE CATEGORIE */}
          <section className="category-list">
            <div className="header-row sticky-header">
              <span>{t("categories")}</span>
              <span>{t("actions")}</span>
            </div>
            <div className="scrollable-area">
              {categorie.map((cat: Categoria) => (
                <div key={cat.id} className="category-item-container">
                  <div
                    className={`category-row ${expandedRow === cat.id ? "active" : ""}`}
                  >
                    <div
                      className="info"
                      onClick={() =>
                        setExpandedRow(expandedRow === cat.id ? null : cat.id)
                      }
                    >
                      <i
                        className={`pi ${expandedRow === cat.id ? "pi-chevron-down" : "pi-chevron-right"} arrow-icon`}
                      ></i>
                      <span className="cat-name">{cat.nome}</span>
                    </div>
                    <div className="actions">
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
                        onClick={(e) => deleteObject(e, cat.id)}
                      />
                    </div>
                  </div>
                  {expandedRow === cat.id && (
                    <div className="subcategory-list">
                      {cat.sottocategorie?.map((sub) => (
                        <div key={sub.id} className="subcategory-row">
                          <div className="sub-info">
                            <i
                              className="pi pi-minus"
                              style={{
                                fontSize: "0.7rem",
                                marginRight: "0.625rem",
                              }}
                            ></i>
                            <span>{sub.nome}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
      </div>
    </>
  );
}
