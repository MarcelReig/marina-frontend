import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Order from "./Order";
import { useEffect } from "react";

const CartDrawer = ({ isOpen, onClose, products, order, onRemoveFromOrder, onIncrement, onDecrement }) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-drawer-overlay" onClick={onClose} aria-hidden="true" />
      <div className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <div className="cart-drawer-header">
          <h2 id="cart-drawer-title">Mi Carrito</h2>
          <button 
            className="close-drawer-btn" 
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="cart-drawer-content">
          <Order
            products={products}
            order={order}
            onRemoveFromOrder={onRemoveFromOrder}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        </div>
      </div>
    </>
  );
};

CartDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  products: PropTypes.object.isRequired,
  order: PropTypes.object.isRequired,
  onRemoveFromOrder: PropTypes.func.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired,
};

export default CartDrawer;

