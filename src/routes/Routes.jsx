import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LayoutPublic from "../components/layout/LayoutPublic";
import App from "../App";
import Auth from "../components/pages/Auth";
import About from "../components/pages/About";
import Contact from "../components/pages/Contact";
import Shop from "../components/pages/Shop";
import NotFound from "../components/pages/NotFound";
import PortfolioDetail from "../components/portfolio/PortfolioDetail";
import PortfolioManager from "../components/pages/PortfolioManager";
import InventoryManager from "../components/pages/InventoryManager";

const Routes = () => {
  
  const [loggedInStatus, setLoggedInStatus] = useState("NOT_LOGGED_IN");

  const handleSuccessfulLogin = () => {
    setLoggedInStatus("LOGGED_IN");
  };

  const handleUnsuccessfulLogin = () => {
    setLoggedInStatus("NOT_LOGGED_IN");
  };

  const handleSuccessfulLogout = () => {
    setLoggedInStatus("NOT_LOGGED_IN");
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <LayoutPublic
          loggedInStatus={loggedInStatus}
          handleSuccessfulLogout={handleSuccessfulLogout}
        />
      ),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <App />,
        },
        {
          path: "/auth",
          element: (
            <Auth
              handleSuccessfulLogin={handleSuccessfulLogin}
              handleUnsuccessfulLogin={handleUnsuccessfulLogin}
            />
          ),
        },
        {
          path: "/about",
          element: <About />,
        },
        {
          path: "/shop",
          element: <Shop />,
        },
        {
          path: "/contact",
          element: <Contact />,
        },
        {
          path: "/portfolio/:slug", 
          element: <PortfolioDetail />,
        },
        {
          path: "/portfolio-manager",
          element: (
            <PortfolioManager
              loggedInStatus={loggedInStatus}
              handleSuccessfulLogout={handleSuccessfulLogout}
            />
          ),
        },
        {
          path: "/inventory-manager",
          element: (
            <InventoryManager
              loggedInStatus={loggedInStatus}
              handleSuccessfulLogout={handleSuccessfulLogout}
            />
          ),
        }
      ],
    },
  
  ]);

  return <RouterProvider router={router} />;
};



export default Routes;