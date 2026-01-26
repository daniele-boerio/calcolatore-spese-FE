import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  getCategorie,
  deleteCategoria,
} from "../../features/categorie/apiCalls";
import "./CategoryTagsPage.scss";
import Button from "../../components/Button/Button";
import { Categoria } from "../../features/categorie/interfaces";

const CategoryTagsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Utilizziamo lo stato tipizzato. Nota: assicurati che il nome sia 'categorie' nel rootReducer
  const categorie = useAppSelector((state) => state.categoria.categorie);
  const loading = useAppSelector((state) => state.categoria.loading);

  // expandedRow gestisce l'ID della categoria espansa (string o null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getCategorie());
  }, [dispatch]);

  const handleCreateCat = (): void => {
    console.log("Crea nuova categoria");
  };

  const handleUpdateCat = (id: string): void => {
    console.log("Aggiorna categoria con ID:", id);
  };

  const handleDeleteCat = (id: string): void => {
    if (
      window.confirm(
        "Sei sicuro di voler eliminare questa categoria? Tutte le sottocategorie verranno influenzate.",
      )
    ) {
      dispatch(deleteCategoria({ id }));
    }
  };

  return (
    <div className="categorie-page">
      <Button
        icon="pi pi-plus"
        className="add-category-button"
        compact
        rounded
        onClick={() => handleCreateCat()}
      />
      <div className="page-header">
        <h1>
          <i
            className="pi pi-tags"
            style={{ fontSize: "1.5rem", marginRight: "10px" }}
          ></i>
          Gestione Categorie
        </h1>
      </div>
      <div className="category-list">
        <div className="header-row">
          <span>Nome</span>
          <span>Azioni</span>
        </div>

        {loading ? (
          <div className="loading-container">
            <i
              className="pi pi-spin pi-spinner"
              style={{ fontSize: "2.5rem", color: "#3B82F6" }}
            ></i>
            <p>Caricamento categorie...</p>
          </div>
        ) : (
          categorie.map((cat: Categoria) => (
            <div key={cat.id} className="category-item-container">
              {/* RIGA CATEGORIA PADRE */}
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
                    className={`pi ${
                      expandedRow === cat.id
                        ? "pi-chevron-down"
                        : "pi-chevron-right"
                    } arrow-icon`}
                  ></i>
                  <span className="cat-name">{cat.nome}</span>
                </div>
                <div className="actions">
                  <Button
                    className="trasparent-button"
                    icon="pi pi-pencil"
                    compact
                    onClick={() => handleUpdateCat(cat.id)}
                  />
                  <Button
                    className="trasparent-danger-button"
                    icon="pi pi-trash"
                    compact
                    onClick={() => handleDeleteCat(cat.id)}
                  />
                </div>
              </div>

              {/* LIVELLO SOTTOCATEGORIE */}
              {expandedRow === cat.id && (
                <div className="subcategory-list">
                  {cat.sottocategorie && cat.sottocategorie.length > 0 ? (
                    cat.sottocategorie.map((sub) => (
                      <div key={sub.id} className="subcategory-row">
                        <div className="sub-info">
                          <i
                            className="pi pi-minus"
                            style={{
                              fontSize: "0.7rem",
                              marginRight: "10px",
                              color: "#ccc",
                            }}
                          ></i>
                          <span>{sub.nome}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <i className="pi pi-info-circle"></i> Nessuna
                      sottocategoria presente
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryTagsPage;
