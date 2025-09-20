import PropTypes from "prop-types";
import { formatPrice } from "../../utils/formatPrice";

const Product = ({ details, onAddToOrder, index }) => {
  const { image, name, price, description } = details;

  return (
    <li className="menu-product">
      <div className="product-wrapper">
        <img src={image} alt={name} />

        <div className="right-stuff">
          <div className="title-wrapper">
            <h3 className="product-name">{name}</h3>
            <h3 className="price">{formatPrice(price)}</h3>
          </div>

          <p>{description}</p>

          <button className="btn" onClick={() => onAddToOrder(index)}>
            Añadir Al Carrito
          </button>
        </div>
      </div>
    </li>
  );
};

Product.propTypes = {
  details: PropTypes.shape({
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string,
  }).isRequired,
  onAddToOrder: PropTypes.func.isRequired,
  index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Product;


