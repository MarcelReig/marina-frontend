import { NavLink } from "react-router-dom";
import { useState } from "react";
import PropTypes from "prop-types";

const Navbar = ({ loggedInStatus, handleSuccessfulLogout }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  return (
    <div className="navigation">
      <NavLink to="/" className="brand-name">
        Marina
      </NavLink>
      <button
        className="hamburger"
        onClick={() => {
          setIsNavExpanded(!isNavExpanded);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="white"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={
          isNavExpanded ? "navigation-menu expanded" : "navigation-menu"
        }
      >
        <ul>
          <li className="nav-link-wrapper">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "nav-link-active" : "")}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-link-wrapper">
            <NavLink
              to="about"
              className={({ isActive }) => (isActive ? "nav-link-active" : "")}
            >
              About
            </NavLink>
          </li>
          <li className="nav-link-wrapper">
            <NavLink
              to="shop"
              className={({ isActive }) => (isActive ? "nav-link-active" : "")}
            >
              Shop
            </NavLink>
          </li>
          <li className="nav-link-wrapper">
            <NavLink
              to="contact"
              className={({ isActive }) => (isActive ? "nav-link-active" : "")}
            >
              Contact
            </NavLink>
          </li>
          {loggedInStatus === "LOGGED_IN" && (
          <>
            <li>
              <NavLink to="/portfolio-manager">Portfolio Manager</NavLink>
            </li>
            <li>
              <NavLink to="/inventory-manager">Inventory Manager</NavLink>
            </li>
          </>
        )}
        <li>
          <button onClick={handleSuccessfulLogout}>Logout</button>
        </li>
        </ul>
      </div>
    </div>
  );
};
Navbar.propTypes = {
  loggedInStatus: PropTypes.string.isRequired,
  handleSuccessfulLogout: PropTypes.func.isRequired,
};

export default Navbar;

