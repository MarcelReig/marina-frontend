import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Login from "../authentication/Login"
import loginImg from "../../images/auth/login.jpg";

const Auth = ({ handleSuccessfulLogin, handleUnsuccessfulLogin }) => {
  const navigate = useNavigate();

  const handleSuccessfulAuth = useCallback(() => {
    handleSuccessfulLogin();
    navigate("/");
  }, [handleSuccessfulLogin, navigate]);

  const handleUnsuccessfulAuth = useCallback(() => {
    handleUnsuccessfulLogin();
  }, [handleUnsuccessfulLogin]);

  return (
    <div className="auth-page-wrapper">
      <div
        className="left-column"
        style={{
          backgroundImage: `url(${loginImg})`,
        }}
      />

      <div className="right-column">
        <Login
          handleSuccessfulAuth={handleSuccessfulAuth}
          handleUnsuccessfulAuth={handleUnsuccessfulAuth}
        />
      </div>
    </div>
  );
};

// Validación de props usando PropTypes
Auth.propTypes = {
  handleSuccessfulLogin: PropTypes.func.isRequired,
  handleUnsuccessfulLogin: PropTypes.func.isRequired,
};

export default Auth;
