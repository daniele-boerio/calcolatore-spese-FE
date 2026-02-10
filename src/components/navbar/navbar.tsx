import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useI18n } from "../../i18n/use-i18n"; // Verifica che il path sia corretto
import "./navbar.scss";

export default function Navbar() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      {/* 1. LATO SINISTRO: Hamburger sempre presente */}
      <div className="navbar-left">
        <div
          className={`hamburger ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      {/* 2. CENTRO: Logo */}
      <div className="navbar-center">
        <div className="navbar-logo">SpassoConto</div>
      </div>

      {/* 3. LATO DESTRO: Spazio vuoto */}
      <div className="navbar-right"></div>

      {/* Menu Laterale (Sidebar) */}
      <div className={`nav-sidebar ${isOpen ? "active" : ""}`}>
        <ul className="nav-links">
          <li>
            <NavLink to="/" onClick={closeMenu}>
              {t("nav_dashboard")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/categories" onClick={closeMenu}>
              {t("nav_categories")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/tags" onClick={closeMenu}>
              {t("nav_tags")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/transactions" onClick={closeMenu}>
              {t("nav_transactions")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/accounts" onClick={closeMenu}>
              {t("nav_accounts")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/investimenti" onClick={closeMenu}>
              {t("nav_investments")}
            </NavLink>
          </li>
        </ul>
      </div>

      {isOpen && <div className="overlay" onClick={closeMenu}></div>}
    </nav>
  );
}
