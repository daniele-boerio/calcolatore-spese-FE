import React, { useState } from "react";
import "./statistics_page.scss";
import { useI18n } from "../../i18n/use-i18n";
import { MenuItem } from "primereact/menuitem";
import { TabMenu } from "primereact/tabmenu";
import YearStatistics from "./year_statistics/year_statistics";
import MonthStatistics from "./month_statistics/month_statistics";

export default function TransactionPage() {
  const { t } = useI18n();

  // 1. Stato per gestire il tab attivo
  const [activeIndex, setActiveIndex] = useState(0);

  // 2. Definizione degli item del menu
  const items: MenuItem[] = [
    { label: t("month_statistics"), icon: "pi pi-list" },
    { label: t("year_statistics"), icon: "pi pi-calendar" },
  ];

  // 3. Funzione per renderizzare il contenuto in base all'indice
  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <MonthStatistics />;
      case 1:
        return <YearStatistics />;
      default:
        return null;
    }
  };

  return (
    <div className="statistics-page-container">
      <div className="card-menu">
        <TabMenu
          model={items}
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
        />
      </div>

      <div className="tab-content-area" key={activeIndex}>
        {renderContent()}
      </div>
    </div>
  );
}
