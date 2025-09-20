import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { formatPrice } from '../../utils/formatPrice';

const InventorySidebarList = ({ data, onDeleteClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="portfolio-sidebar-list-wrapper">
        <div className="no-items">
          <p className="empty-message">No hay productos en el inventario</p>
        </div>
      </div>
    );
  }

  const inventoryList = data.map((product) => {
    const id = product._id && product._id.$oid ? product._id.$oid : product._id;
    
    return (
      <div key={id} className="portfolio-item-thumb">
        <div className="portfolio-thumb-img">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="text-content">
          <div className="title">{product.name}</div>
          <div className="price">{formatPrice(product.price)}</div>
          <button
            className="delete-icon"
            onClick={() => onDeleteClick(product)}
            aria-label={`Eliminar ${product.name}`}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    );
  });

  return <div className="portfolio-sidebar-list-wrapper">{inventoryList}</div>;
};

InventorySidebarList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string
  })),
  onDeleteClick: PropTypes.func.isRequired,
};

export default InventorySidebarList;

