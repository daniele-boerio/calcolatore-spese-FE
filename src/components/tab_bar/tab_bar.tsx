import { NavLink } from "react-router-dom";
import { useI18n } from "../../i18n/use-i18n";
import { useAppDispatch } from "../../store/store";
import { openSheet } from "../../features/ui/ui_slice";
import "./tab_bar.scss";

type Tab = {
  to: string;
  icon: string;
  labelKey: string;
};

// Quattro slot di navigazione più il FAB centrale: la barra è l'unica
// navigazione dell'app, non c'è più un menu laterale.
const TABS: Tab[] = [
  { to: "/", icon: "pi pi-home", labelKey: "nav_home" },
  { to: "/transactions", icon: "pi pi-list", labelKey: "nav_movements" },
  { to: "/analysis", icon: "pi pi-chart-bar", labelKey: "nav_analysis" },
  { to: "/accounts", icon: "pi pi-wallet", labelKey: "nav_accounts" },
];

export default function TabBar() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const [left, right] = [TABS.slice(0, 2), TABS.slice(2)];

  const renderTab = (tab: Tab) => (
    <NavLink
      key={tab.to}
      to={tab.to}
      end={tab.to === "/"}
      className="tab-bar__slot"
    >
      <i className={tab.icon} aria-hidden="true" />
      <span className="tab-bar__label">{t(tab.labelKey)}</span>
    </NavLink>
  );

  return (
    <nav className="tab-bar" aria-label={t("nav_primary")}>
      {left.map(renderTab)}

      <button
        type="button"
        className="tab-bar__fab"
        aria-label={t("new_transaction")}
        onClick={() => dispatch(openSheet({ name: "newTransaction" }))}
      >
        <i className="pi pi-plus" aria-hidden="true" />
      </button>

      {right.map(renderTab)}
    </nav>
  );
}
