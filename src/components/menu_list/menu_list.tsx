import { Link } from "react-router-dom";
import "./menu_list.scss";

export type MenuEntry = {
  to: string;
  icon: string;
  label: string;
  /** Valore a destra (es. il totale investito). */
  value?: string;
  /** Colora il valore come negativo (residuo debiti). */
  negative?: boolean;
};

/**
 * Card-lista che ha assorbito il vecchio menu laterale: le destinazioni
 * secondarie dell'app vivono in fondo a "Conti", non dietro un hamburger.
 */
export default function MenuList({ entries }: { entries: MenuEntry[] }) {
  return (
    <nav className="menu-list">
      {entries.map((entry) => (
        <Link key={entry.to} to={entry.to} className="menu-list__row">
          <span className="menu-list__icon" aria-hidden="true">
            <i className={entry.icon} />
          </span>

          <span className="menu-list__label">{entry.label}</span>

          {entry.value && (
            <span
              className={`menu-list__value amount ${
                entry.negative ? "menu-list__value--negative" : ""
              }`}
            >
              {entry.value}
            </span>
          )}

          <i className="pi pi-chevron-right menu-list__chevron" aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}
