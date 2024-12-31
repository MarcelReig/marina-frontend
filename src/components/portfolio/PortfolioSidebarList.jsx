import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

const PortfolioSidebarList = ({ data = [], handleDeleteClick }) => {
  const portfolioList = data.map((portfolioItem) => (
    <div key={portfolioItem._id.$oid} className="portfolio-item-thumb">
      <div className="portfolio-thumb-img">
        <img src={portfolioItem.thumb_img_url} alt={portfolioItem.name} />
      </div>

      <div className="text-content">
        <div className="title">{portfolioItem.name}</div>
        <a
          className="delete-icon"
          onClick={() => handleDeleteClick(portfolioItem)}
          aria-label={`Delete ${portfolioItem.name}`}
        >
          <FontAwesomeIcon icon={faTrash} />
        </a>
      </div>
    </div>
  ));

  return <div className="portfolio-sidebar-list-wrapper">{portfolioList}</div>;
};

PortfolioSidebarList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.shape({
        $oid: PropTypes.string.isRequired,
      }).isRequired,
      thumb_img_url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleDeleteClick: PropTypes.func.isRequired,
};

export default PortfolioSidebarList;
