import { useEffect, useState } from "react";
import http from "../../api/http";

import PortfolioItem from "./PortfolioItem";
import SkeletonPortfolio from "../skeletons/SkeletonPortfolio";


function PortfolioContainer() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPortfolioItems = async () => {
    try {
      const response = await http.get(`/portfolio`);
      setPortfolioItems(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPortfolioItems();
  }, []); // Se ejecuta solo una vez al montar el componente

  if (loading) {
    return (
      <div className="portfolio-items-wrapper">
        <SkeletonPortfolio />
        <SkeletonPortfolio />
        <SkeletonPortfolio />
        <SkeletonPortfolio />
        <SkeletonPortfolio />
        <SkeletonPortfolio />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="portfolio-items-wrapper">
      {portfolioItems.map((item) => {
        const id = item._id && item._id.$oid ? item._id.$oid : item._id;
        return <PortfolioItem key={id} item={item} />;
      })}
    </div>
  );
}

export default PortfolioContainer;
