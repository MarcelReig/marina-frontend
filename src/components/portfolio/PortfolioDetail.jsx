import { useState, useEffect } from "react";
import axios from "axios";
import PhotoAlbum from "react-photo-album";
import "react-photo-album/styles.css";
import { useParams } from "react-router-dom";

const PortfolioDetail = () => {
  const [portfolioItem, setPortfolioItem] = useState({});
  const [photos, setPhotos] = useState([]);
  const { slug } = useParams();

  useEffect(() => {
    const getPortfolioItem = async () => {
      try {
        const response = await axios.get(
          `https://marina-backend.onrender.com/portfolio/${slug}`
        );
        setPortfolioItem(response.data);
        processGallery(response.data.gallery);
      } catch (error) {
        console.log("getPortfolioItem error", error);
      }
    };

    const processGallery = (gallery) => {
      if (gallery) {
        const processedPhotos = gallery.map((item) => ({
          src: item.dataURL,
          width: item.width,
          height: item.height,
        }));
        setPhotos(processedPhotos);
      }
    };

    getPortfolioItem();
  }, [slug]);

  const { description, name } = portfolioItem;

  return (
    <div className="portfolio-detail-wrapper">
      <div className="portfolio-detail-header">
        <h2>{name}</h2>
        <p>{description}</p>
      </div>
      <PhotoAlbum photos={photos} layout="rows" targetRowHeight={100}  rowConstraints={{ singleRowMaxHeight: 250 }}/>
    </div>
  );
};

export default PortfolioDetail;
