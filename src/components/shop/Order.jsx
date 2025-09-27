import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faXmark, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { formatPrice } from "../../utils/formatPrice";

import { useMemo, useState } from "react";
import http from "../../api/http";

const Order = ({ products, order, onRemoveFromOrder, onIncrement, onDecrement }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const orderIds = Object.keys(order || {});
  const total = useMemo(() => {
    return orderIds.reduce((sum, key) => {
      const product = products[key];
      const count = order[key];
      if (!product) return sum;
      return sum + count * product.price;
    }, 0);
  }, [orderIds, products, order]);

  const buildSecureItems = () => {
    return orderIds.map((key) => {
      const p = products[key];
      const q = order[key];
      const id = p?._id?.$oid || p?._id;
      return { productId: id, quantity: q };
    }).filter((it) => it.productId && it.quantity > 0);
  };

  const startCheckout = async () => {
    if (orderIds.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const items = buildSecureItems();
      const res = await http.post("/store/checkout/session", { items, currency: "EUR" }, {
        headers: { "Content-Type": "application/json" },
      });
      const url = res?.data?.url;
      if (url) {
        window.location.assign(url);
      }
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert("No se pudo iniciar el pago. Inténtalo de nuevo.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="order-wrap">
      <div className="cart-title">
        <h2>Carrito</h2>
        <FontAwesomeIcon icon={faCartShopping} />
      </div>
      <ul className="order" aria-live="polite">
        {orderIds.map((key) => {
          const product = products[key];
          const count = order[key];
          if (!product) return null;
          return (
            <li key={key}>
              <div className="qty-controls">
                <button onClick={() => onDecrement(key)} aria-label={`Disminuir cantidad de ${product.name}`}>
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <div className="qty" aria-label={`Cantidad de ${product.name}`}>{count}</div>
                <button onClick={() => onIncrement(key)} aria-label={`Aumentar cantidad de ${product.name}`}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
              <div className="line-name">{product.name}</div>
              <div className="line-subtotal">{formatPrice(count * product.price)}</div>
              <button onClick={() => onRemoveFromOrder(key)} aria-label={`Quitar ${product.name} del carrito`}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="total">Total: <strong>{formatPrice(total)}</strong></div>
      <button
        onClick={startCheckout}
        className="btn checkout-btn"
        disabled={orderIds.length === 0 || isCheckingOut}
        aria-disabled={orderIds.length === 0 || isCheckingOut}
      >
        {orderIds.length === 0 ? "Añade productos para continuar" : isCheckingOut ? "Redirigiendo..." : "Checkout"}
      </button>
    </div>
  );
};

Order.propTypes = {
  products: PropTypes.object.isRequired,
  order: PropTypes.object.isRequired,
  onRemoveFromOrder: PropTypes.func.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired,
};

export default Order;


