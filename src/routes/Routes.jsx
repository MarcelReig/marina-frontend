import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import LayoutPublic from "../components/layout/LayoutPublic";
import App from "../App";
import Auth from "../components/pages/Auth";
import About from "../components/pages/About";
import Contact from "../components/pages/Contact";
import Shop from "../components/pages/Shop";
import NotFound from "../components/pages/NotFound";
import PortfolioDetail from "../components/portfolio/PortfolioDetail";
import PortfolioManager from "../components/pages/PortfolioManager";
import PortfolioEdit from "../components/pages/PortfolioEdit";
import InventoryManager from "../components/pages/InventoryManager";

const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <AuthProvider>
          <LayoutPublic />
        </AuthProvider>
      ),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <App />,
        },
        {
          path: "/auth",
          element: <Auth />,
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
          path: "/portfolio/:id", 
          element: <PortfolioDetail />,
        },
        {
          element: <ProtectedRoute allowRoles={["admin", "super_admin"]} />,
          children: [
            {
              path: "/portfolio-manager",
              element: <PortfolioManager />,
            },
            {
              path: "/portfolio-manager/edit/:id",
              element: <PortfolioEdit />,
            },
            {
              path: "/inventory-manager",
              element: <InventoryManager />,
            },
          ],
        },
      ],
    },
  
  ]);

  return <RouterProvider router={router} />;
};



export default Routes;