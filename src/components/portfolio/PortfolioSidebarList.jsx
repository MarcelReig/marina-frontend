import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const PortfolioSidebarList = ({ data = [], handleDeleteClick }) => {
  const navigate = useNavigate();
  
  const handleEditClick = (portfolioItem) => {
    const id = typeof portfolioItem._id === 'object' ? portfolioItem._id.$oid : portfolioItem._id;
    navigate(`/portfolio-manager/edit/${id}`);
  };
  
  const portfolioList = data.map((portfolioItem) => {
    const id = typeof portfolioItem._id === 'object' ? portfolioItem._id.$oid : portfolioItem._id;
    return (
      <div key={id} className="portfolio-item-thumb">
        <div className="portfolio-thumb-img">
          <img src={portfolioItem.thumb_img_url} alt={portfolioItem.name} />
        </div>

        <div className="text-content">
          <div className="title">{portfolioItem.name}</div>
          <div className="action-icons">
            <button
              className="edit-icon"
              onClick={() => handleEditClick(portfolioItem)}
              aria-label={`Editar ${portfolioItem.name}`}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="delete-icon"
              onClick={() => handleDeleteClick(portfolioItem)}
              aria-label={`Eliminar ${portfolioItem.name}`}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      </div>
    );
  });

  return <div className="portfolio-sidebar-list-wrapper">{portfolioList}</div>;
};

PortfolioSidebarList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          $oid: PropTypes.string
        })
      ]).isRequired,
      thumb_img_url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleDeleteClick: PropTypes.func.isRequired,
};

export default PortfolioSidebarList;
