import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { formatPrice } from "../../utils/formatPrice";

const FloatingCartButton = ({ itemCount, total, onClick }) => {
  if (itemCount === 0) return null;

  return (
    <button className="floating-cart-btn" onClick={onClick} aria-label="Ver carrito">
      <div className="cart-info">
        <FontAwesomeIcon icon={faCartShopping} className="cart-icon" />
        <span className="item-count">{itemCount}</span>
      </div>
      <div className="cart-total">
        <span>Ver Carrito</span>
        <strong>{formatPrice(total)}</strong>
      </div>
    </button>
  );
};

FloatingCartButton.propTypes = {
  itemCount: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default FloatingCartButton;

