import { Link } from "react-router-dom";

const CheckoutCancel = () => {
  return (
    <div className="orders-page">
      <h2>Pago cancelado</h2>
      <p>El proceso de pago fue cancelado. Tu carrito sigue disponible.</p>
      <p>
        <Link className="btn" to="/shop">Volver a la tienda</Link>
      </p>
    </div>
  );
};

export default CheckoutCancel;
