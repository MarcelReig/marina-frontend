import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import useAuth from "../context/useAuth";

const ProtectedRoute = ({ allowRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (allowRoles && allowRoles.length > 0) {
    const role = user?.role;
    if (!role || !allowRoles.includes(role)) return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = { allowRoles: PropTypes.arrayOf(PropTypes.string) };

export default ProtectedRoute;


