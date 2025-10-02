import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();

  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate("/"); // Redirect to home page
  };

  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const navRef = useRef(null);

  const handleNavLinkClick = () => {
    setIsNavExpanded(false); // Close menu when a link is clicked
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsNavExpanded(false);
      }
    };

    if (isNavExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavExpanded]);

  return (
    <div className="navigation" ref={navRef}>
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
              onClick={handleNavLinkClick}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-link-wrapper">
            <NavLink
              to="about"
              className={({ isActive }) => (isActive ? "nav-link-active" : "")}
              onClick={handleNavLinkClick}
            >
              About
            </NavLink>
          </li>
          <li className="nav-link-wrapper">
            <NavLink
              to="shop"
              className={({ isActive }) => (isActive ? "nav-link-active" : "")}
              onClick={handleNavLinkClick}
            >
              Shop
            </NavLink>
          </li>
          <li className="nav-link-wrapper">
            <NavLink
              to="contact"
              className={({ isActive }) => (isActive ? "nav-link-active" : "")}
              onClick={handleNavLinkClick}
            >
              Contact
            </NavLink>
          </li>
          {isAuthenticated && (
            <>
              <li className="nav-link-wrapper">
                <NavLink
                  to="/portfolio-manager"
                  className={({ isActive }) =>
                    isActive ? "nav-link-active" : ""
                  }
                  onClick={handleNavLinkClick}
                >
                  Portfolio Manager
                </NavLink>
              </li>
              <li className="nav-link-wrapper">
                <NavLink
                  to="/inventory-manager"
                  className={({ isActive }) =>
                    isActive ? "nav-link-active" : ""
                  }
                  onClick={handleNavLinkClick}
                >
                  Inventory Manager
                </NavLink>
              </li>
              <li className="nav-link-wrapper">
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    isActive ? "nav-link-active" : ""
                  }
                  onClick={handleNavLinkClick}
                >
                  Pedidos
                </NavLink>
              </li>
              {user?.role === "super_admin" && (
                <li className="nav-link-wrapper">
                  <NavLink
                    to="/user-manager"
                    className={({ isActive }) =>
                      isActive ? "nav-link-active" : ""
                    }
                    onClick={handleNavLinkClick}
                  >
                    User Manager
                  </NavLink>
                </li>
              )}
              <li className="logout-item">
                <a 
                  onClick={() => {
                    handleLogoutClick();
                    handleNavLinkClick();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                </a>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
