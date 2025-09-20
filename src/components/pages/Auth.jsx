import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../authentication/Login"
import loginImg from "../../images/auth/login.jpg";

const Auth = () => {
  const navigate = useNavigate();

  const handleSuccessfulAuth = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleUnsuccessfulAuth = useCallback(() => {
    // noop; Login shows errors
  }, []);

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

export default Auth;
