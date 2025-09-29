import { useState } from "react";

import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { coverUrl } from "../../utils/cloudinary";

const PortfolioItem = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const { _id, thumb_img_url, name } = item;
  const bgUrl = coverUrl(thumb_img_url);

  return (
    <Link to={`/portfolio/${_id?.$oid || _id}`} className="portfolio-card-link">
      <article
        className={`portfolio-card ${isHovered ? 'portfolio-card--hovered' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="portfolio-card__image"
          style={{
            backgroundImage: `url(${bgUrl})`,
          }}
        />
        <div className="portfolio-card__overlay">
          <h2 className="portfolio-card__title">{name}</h2>
        </div>
      </article>
    </Link>
  );
};

PortfolioItem.propTypes = {
  item: PropTypes.object.isRequired,
};

export default PortfolioItem;
