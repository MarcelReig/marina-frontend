import { useEffect, useState } from "react";
import axios from "axios";

import PortfolioItem from "./PortfolioItem";

function PortfolioContainer() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPortfolioItems = async () => {
    try {
      const response = await axios.get(
        "https://marina-backend.onrender.com/portfolio"
      );
      setPortfolioItems(response.data);
      console.log("response", response);
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="portfolio-items-wrapper">
      {portfolioItems.map((item) => {
        return (
          <PortfolioItem
            key={item._id.$oid}
            item={item}
          />
        );
      })}
    </div>
  );
}

export default PortfolioContainer;
