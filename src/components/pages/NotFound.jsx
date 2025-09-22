import { useRouteError, Link } from "react-router-dom";

function NotFound() {
  const error = useRouteError();
  console.log(error);

  return (
    <div className="error-page">
      <div className="error-content">
        <h1>¡Oops!</h1>
        <p>Lo sentimos, ha ocurrido un error inesperado.</p>
        <div className="error-details">
          <code>{error.statusText || error.message}</code>
        </div>
        <Link to="/" className="btn">
          Volver a la Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
