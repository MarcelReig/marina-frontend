import { useState } from "react";

import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const PortfolioItem = ({ item }) => {
  const [portfolioItemClass, setPortfolioItemClass] = useState("");

  const handleMouseEnter = () => {
    setPortfolioItemClass("image-blur");
  };

  const handleMouseLeave = () => {
    setPortfolioItemClass("");
  };

  const { _id, thumb_img_url, name } = item;

  return (
    <Link to={`/portfolio/${_id.$oid}`}>
      <div
        className="portfolio-item-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={"portfolio-img-background " + portfolioItemClass}
          style={{
            backgroundImage: "url(" + thumb_img_url + ")",
          }}
        />
        <div className="collection-title-wrapper">
          <h2 className="collection-title">{name}</h2>
        </div>
      </div>
    </Link>
  );
};

PortfolioItem.propTypes = {
  item: PropTypes.object.isRequired,
};

export default PortfolioItem;
