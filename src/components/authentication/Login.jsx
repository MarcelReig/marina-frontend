import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import http from "../../api/http";
import useAuth from "../../context/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

// Base URL handled by http client

const Login = ({ handleSuccessfulAuth, handleUnsuccessfulAuth }) => {
  const authCtx = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
    setErrorText("");
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      http
        .post(
          `/token`,
          {
            email,
            password,
          }
        )
        .then((response) => {
          if (response?.status === 200 && response?.data?.access_token && (authCtx?.loginWithRefresh || authCtx?.login)) {
            const access = response.data.access_token;
            const refresh = response.data.refresh_token;
            const user = response.data.user || null;
            // Persist tokens and user in AuthContext + sessionStorage
            if (authCtx?.loginWithRefresh) {
              authCtx.loginWithRefresh(access, refresh, user);
            } else {
              authCtx.login(access, user);
            }
            handleSuccessfulAuth();
          } else {
            setErrorText("Wrong email or password");
            handleUnsuccessfulAuth();
          }
        })
        .catch(() => {
          setErrorText("Algo salió mal");
          handleUnsuccessfulAuth();
        });
    },
    [email, password, handleSuccessfulAuth, handleUnsuccessfulAuth, authCtx]
  );

  return (
    <div>
      <h1>Autentícate para acceder al dashboard</h1>

      <div>{errorText}</div>

      <form onSubmit={handleSubmit} className="auth-form-wrapper">
        <div className="form-group">
          <FontAwesomeIcon icon={faEnvelope} />
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <FontAwesomeIcon icon={faLock} />
          <input
            type="password"
            name="password"
            placeholder="Your password"
            value={password}
            onChange={handleChange}
          />
        </div>

        <button className="btn" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

// Validación de props usando PropTypes
Login.propTypes = {
  handleSuccessfulAuth: PropTypes.func.isRequired,
  handleUnsuccessfulAuth: PropTypes.func.isRequired,
};

export default Login;
