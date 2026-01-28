import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  getCategorie,
  deleteCategoria,
  updateCategoria,
  createCategoria,
} from "../../features/categorie/apiCalls";
import "./CategoryTagsPage.scss";
import Button from "../../components/Button/Button";
import { Categoria } from "../../features/categorie/interfaces";
import CategoryDialog from "../../components/Dialog/CategoryDialog/CategoryTagDialog";
import { deleteTag, getTags } from "../../features/tags/apiCalls";
import { Tag } from "../../features/tags/interfaces";

const CategoryTagsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const categorie = useAppSelector((state) => state.categoria.categorie);
  const loading = useAppSelector((state) => state.categoria.loading);

  // Supponendo tu abbia i tag nello store (aggiungi se mancano)
  const tags = useAppSelector((state) => state.tag?.tags || []);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
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
    setIsDialogVisible(true);
  };

  const handleOpenEdit = (cat: Categoria) => {
    setSelectedCategory(cat);
    setIsDialogVisible(true);
  };

  const handleDeleteCat = (id: string): void => {
    if (window.confirm("Sei sicuro di voler eliminare questa categoria?")) {
      dispatch(deleteCategoria({ id }));
    }
  };

  const handleDeleteTag = (id: string): void => {
    if (window.confirm("Sei sicuro di voler eliminare questo tag?")) {
      dispatch(deleteTag({ id }));
    }
  };

  return (
    <div className="categorie-page">
      <div className="page-header">
        <h1>
          <i
            className="pi pi-tags"
            style={{ fontSize: "1.5rem", marginRight: "10px" }}
          ></i>
          Gestione Categorie e Tag
        </h1>
      </div>

      <div className="split-wrapper">
        {/* SEZIONE CATEGORIE */}
        <section className="category-list">
          <div className="header-row sticky-header">
            <span>Categorie</span>
            <span>Azioni</span>
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
                      onClick={() => handleOpenEdit(cat)}
                    />
                    <Button
                      className="trasparent-danger-button"
                      icon="pi pi-trash"
                      compact
                      onClick={() => handleDeleteCat(cat.id)}
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
            <span>Tags</span>
            <span>Azioni</span>
          </div>
          <div className="scrollable-area">
            {tags.map((tag) => (
              <div key={tag.id} className="category-row">
                <div className="info">
                  <span className="cat-name">{tag.nome}</span>
                </div>
                <div className="actions">
                  <Button
                    className="trasparent-button"
                    icon="pi pi-pencil"
                    compact
                  />
                  <Button
                    className="trasparent-danger-button"
                    icon="pi pi-trash"
                    compact
                    onClick={() => handleDeleteTag(tag.id)}
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

      <CategoryDialog
        visible={isDialogVisible}
        category={selectedCategory}
        onHide={() => setIsDialogVisible(false)}
        loading={loading}
      />

      <TagDialog
        visible={isDialogVisible}
        tag={selectedTag}
        onHide={() => setIsDialogVisible(false)}
        loading={loading}
      />
    </div>
  );
};

export default CategoryTagsPage;
