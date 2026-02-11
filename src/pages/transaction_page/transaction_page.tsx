import React, { useState } from "react";
import "./transaction_page.scss";
import { useI18n } from "../../i18n/use-i18n";
import { MenuItem } from "primereact/menuitem";
import { TabMenu } from "primereact/tabmenu";
import Transactions from "./transactions/transactions";
import Recurrings from "./recurrings/recurrings";

export default function TransactionPage() {
  const { t } = useI18n();

  // 1. Stato per gestire il tab attivo
  const [activeIndex, setActiveIndex] = useState(0);

  // 2. Definizione degli item del menu
  const items: MenuItem[] = [
    { label: t("transactions"), icon: "pi pi-list" },
    { label: t("recurring"), icon: "pi pi-refresh" },
  ];

  // 3. Funzione per renderizzare il contenuto in base all'indice
  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <Transactions />;
      case 1:
        return <Recurrings />;
      default:
        return null;
    }
  };

  return (
    <div className="transaction-page-container">
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
