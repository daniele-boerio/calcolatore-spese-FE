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

/**
 * Sei destinazioni più il FAB al centro: tre per lato, così il "+" resta in
 * mezzo. A sinistra il flusso — cosa succede ai soldi — a destra dove stanno.
 *
 * Solo icone: sei etichette da 10.5px su 430px verrebbero tagliate a metà.
 * Il nome resta come `aria-label`, che è quello che conta per chi non le vede.
 */
const TABS: Tab[] = [
  { to: "/", icon: "pi pi-home", labelKey: "nav_home" },
  { to: "/transactions", icon: "pi pi-list", labelKey: "nav_movements" },
  { to: "/analysis", icon: "pi pi-chart-bar", labelKey: "nav_analysis" },
  { to: "/accounts", icon: "pi pi-wallet", labelKey: "nav_accounts" },
  { to: "/investments", icon: "pi pi-chart-line", labelKey: "nav_investments" },
  { to: "/altro", icon: "pi pi-ellipsis-h", labelKey: "nav_more" },
];

export default function TabBar() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const [left, right] = [TABS.slice(0, 3), TABS.slice(3)];

  const renderTab = (tab: Tab) => (
    <NavLink
      key={tab.to}
      to={tab.to}
      end={tab.to === "/"}
      className="tab-bar__slot"
      aria-label={t(tab.labelKey)}
      title={t(tab.labelKey)}
    >
      <i className={tab.icon} aria-hidden="true" />
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
