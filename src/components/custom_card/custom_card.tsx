import React from "react";
import "./custom_card.scss";

// Interfacce aggiornate: 'totale' ora è opzionale
export interface SubCategory {
  sottocategoria: string;
  totale?: number;
}

export interface CustomCardProps {
  title: string;
  totale?: number;
  sottocategorie?: SubCategory[];
  actions?: React.ReactNode; // Permette di passare bottoni custom (es. Edit/Delete)
  onClick?: (title: string) => void;
  onSubcategoryClick?: (
    subcategoryTitle: string,
    categoryTitle: string,
  ) => void;
}

export default function CustomCard({
  title,
  totale,
  sottocategorie = [],
  actions,
  onClick,
  onSubcategoryClick,
}: CustomCardProps) {
  // Funzione per determinare il colore in base all'importo (se presente)
  const getAmountColor = (val?: number) => {
    if (val === undefined) return "inherit";
    if (val < 0) return "var(--red-500)";
    if (val > 0) return "var(--green-500)";
    return "inherit";
  };

  return (
    <div className={`custom-category-card ${onClick ? "clickable" : ""}`}>
      <div
        className="category-header"
        onClick={() => onClick && onClick(title)}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        <span className="name">{title}</span>

        {/* Contenitore di destra per importo e/o bottoni */}
        <div
          className="header-right"
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          {totale !== undefined && (
            <span className="amount" style={{ color: getAmountColor(totale) }}>
              {totale > 0 ? "+" : ""}
              {totale.toLocaleString("it-IT", { minimumFractionDigits: 2 })} €
            </span>
          )}

          {/* Renderizza i bottoni solo se vengono passati */}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      </div>

      {sottocategorie.length > 0 && (
        <div className="subcategories-list">
          {sottocategorie.map((sub, idx) => (
            <div
              key={`${sub.sottocategoria}-${idx}`}
              className="subcategory-item"
              onClick={(e) => {
                if (onSubcategoryClick) {
                  e.stopPropagation();
                  onSubcategoryClick(sub.sottocategoria, title);
                }
              }}
              style={{ cursor: onSubcategoryClick ? "pointer" : "default" }}
            >
              <span className="name">{sub.sottocategoria}</span>
              {sub.totale !== undefined && (
                <span className="amount">
                  {sub.totale.toLocaleString("it-IT", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
