import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.scss";

const Navbar = () => {
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

      {/* 3. LATO DESTRO: Spazio vuoto per bilanciare il Flexbox (o icone profilo) */}
      <div className="navbar-right"></div>

      {/* Menu Laterale (Sidebar) */}
      <div className={`nav-sidebar ${isOpen ? "active" : ""}`}>
        <ul className="nav-links">
          <li>
            <NavLink to="/" onClick={closeMenu}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/categorie-tags" onClick={closeMenu}>
              Categorie/Tags
            </NavLink>
          </li>
          <li>
            <NavLink to="/transazioni" onClick={closeMenu}>
              Transazioni
            </NavLink>
          </li>
          <li>
            <NavLink to="/conti" onClick={closeMenu}>
              Conti
            </NavLink>
          </li>
          <li>
            <NavLink to="/investimenti" onClick={closeMenu}>
              Investimenti
            </NavLink>
          </li>
        </ul>
      </div>

      {isOpen && <div className="overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;
