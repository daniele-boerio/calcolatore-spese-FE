import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  getCategorie,
  deleteCategoria,
} from "../../features/categorie/api_calls";
import "./category_tags_page.scss";
import Button from "../../components/button/button";
import { Categoria } from "../../features/categorie/interfaces";
import { deleteTag, getTags } from "../../features/tags/api_calls";
import { Tag } from "../../features/tags/interfaces";
import UpdateCategoryDialog from "../../components/dialog/update_category_dialog/update_category_dialog";
import UpdateTagDialog from "../../components/dialog/update_tag_dialog/update_tag_dialog";
import CreateCatTagDialog from "../../components/dialog/create_cat_tag_dialog/create_cat_tag_dialog";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { useI18n } from "../../i18n/use-i18n";

export default function CategoryTagsPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const categorie = useAppSelector((state: any) => state.categoria.categorie);
  const CatLoading = useAppSelector((state: any) => state.categoria.loading);
  const TagLoading = useAppSelector((state: any) => state.tag.loading);

  // Supponendo tu abbia i tag nello store (aggiungi se mancano)
  const tags = useAppSelector((state: any) => state.tag?.tags || []);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isCreateDialogVisible, setIsCreateDialogVisible] = useState(false);
  const [isDialogCatVisible, setIsDialogCatVisible] = useState(false);
  const [isDialogTagVisible, setIsDialogTagVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(
    null,
  );
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  useEffect(() => {
    dispatch(getCategorie());
    dispatch(getTags()); // Assicurati di chiamare anche i tag
  }, [dispatch]);

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setIsCreateDialogVisible(true);
  };

  const handleOpenCatEdit = (cat: Categoria) => {
    setSelectedCategory(cat);
    setIsDialogCatVisible(true);
  };

  const handleOpenTagEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDialogTagVisible(true);
  };

  const deleteObject = (event: any, id: string, type: string) => {
    confirmPopup({
      target: event.currentTarget,
      message: t("delete_message"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: t("yes"),
      rejectLabel: t("no"),
      accept: () => {
        type === "cat"
          ? dispatch(deleteCategoria({ id }))
          : dispatch(deleteTag({ id }));
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
              style={{ fontSize: "1.5rem", marginRight: "10px" }}
            ></i>
            {t("category_tags_title")}
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
                        onClick={(e) => deleteObject(e, cat.id, "cat")}
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
                                marginRight: "10px",
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

          {/* SEZIONE TAGS */}
          <section className="category-list">
            <div className="header-row sticky-header">
              <span>{t("tags")}</span>
              <span>{t("actions")}</span>
            </div>
            <div className="scrollable-area">
              {tags.map((tag: Tag) => (
                <div key={tag.id} className="category-row">
                  <div className="info">
                    <span className="cat-name">{tag.nome}</span>
                  </div>
                  <div className="actions">
                    <Button
                      className="trasparent-button"
                      icon="pi pi-pencil"
                      compact
                      onClick={() => handleOpenTagEdit(tag)}
                    />
                    <Button
                      className="trasparent-danger-button"
                      icon="pi pi-trash"
                      compact
                      onClick={(e) => deleteObject(e, tag.id, "tag")}
                    />
                  </div>
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

        <UpdateCategoryDialog
          visible={isDialogCatVisible}
          category={selectedCategory!}
          onHide={() => setIsDialogCatVisible(false)}
          loading={CatLoading}
        />

        <UpdateTagDialog
          visible={isDialogTagVisible}
          tag={selectedTag!}
          onHide={() => setIsDialogTagVisible(false)}
          loading={TagLoading}
        />

        <CreateCatTagDialog
          visible={isCreateDialogVisible}
          onHide={() => setIsCreateDialogVisible(false)}
          loading={CatLoading || TagLoading}
        />
      </div>
    </>
  );
}
