import { Outlet } from "react-router-dom";
import Navbar from "../navigation/Navbar";
import PropTypes from "prop-types";

const LayoutPublic = ({ loggedInStatus, handleSuccessfulLogout }) => {
  return (
    <>
      <Navbar
        loggedInStatus={loggedInStatus}
        handleSuccessfulLogout={handleSuccessfulLogout}
      />
      <main>
        <Outlet />
      </main>
      <footer>Footer</footer>
    </>
  );
}

LayoutPublic.propTypes = {
  loggedInStatus: PropTypes.string.isRequired,
  handleSuccessfulLogout: PropTypes.func.isRequired,
};

export default LayoutPublic;
