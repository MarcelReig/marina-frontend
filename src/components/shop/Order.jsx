import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faXmark } from "@fortawesome/free-solid-svg-icons";
import { formatPrice } from "../../utils/formatPrice";

const Order = ({ products, order, onRemoveFromOrder }) => {
  const orderIds = Object.keys(order || {});
  const total = orderIds.reduce((sum, key) => {
    const product = products[key];
    const count = order[key];
    if (!product) return sum;
    return sum + count * product.price;
  }, 0);

  return (
    <div className="order-wrap">
      <div className="cart-title">
        <h2>Carrito</h2>
        <FontAwesomeIcon icon={faCartShopping} />
      </div>
      <ul className="order">
        {orderIds.map((key) => {
          const product = products[key];
          const count = order[key];
          if (!product) return null;
          return (
            <li key={key}>
              <div>{count}</div>
              <div>{product.name}</div>
              <div>{formatPrice(count * product.price)}</div>
              <button onClick={() => onRemoveFromOrder(key)} aria-label="Quitar del carrito">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="total">
        Total: <strong>{formatPrice(total)}</strong>
      </div>
      <button onClick={() => alert("Implement Checkout!")} className="btn checkout-btn">
        Checkout
      </button>
    </div>
  );
};

Order.propTypes = {
  products: PropTypes.object.isRequired,
  order: PropTypes.object.isRequired,
  onRemoveFromOrder: PropTypes.func.isRequired,
};

export default Order;


