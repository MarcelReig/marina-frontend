import { Outlet } from "react-router-dom";
import Navbar from "../navigation/Navbar";
import Footer from "../footer/Footer";
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
      <Footer />
    </>
  );
}

LayoutPublic.propTypes = {
  loggedInStatus: PropTypes.string.isRequired,
  handleSuccessfulLogout: PropTypes.func.isRequired,
};

export default LayoutPublic;
