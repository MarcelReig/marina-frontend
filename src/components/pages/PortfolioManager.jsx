import { useState, useEffect } from "react";
import http from "../../api/http";
import PortfolioSidebarList from "../portfolio/PortfolioSidebarList";
import PortfolioForm from "../portfolio/PortfolioForm";


const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);

  const handleDeleteClick = (portfolioItem) => {
    const id = typeof portfolioItem._id === 'object' ? portfolioItem._id.$oid : portfolioItem._id;
    http
      .delete(`/portfolio/${id}`)
      .then(() => {
        setPortfolioItems((prevItems) =>
          prevItems.filter((item) => {
            const itemId = typeof item._id === 'object' ? item._id.$oid : item._id;
            return itemId !== id;
          })
        );
      })
      .catch((error) => {
        console.log("delete error", error);
      });
  };

  const handleSuccessfulFormSubmission = (portfolioItem) => {
    setPortfolioItems((prevItems) => [portfolioItem, ...prevItems]);
  };

  const handleFormSubmissionError = (error) => {
    console.log("handleFormSubmissionError error", error);
  };

  const getPortfolioItems = () => {
    http
      .get(`/portfolio`)
      .then((response) => {
        setPortfolioItems(response.data);
      })
      .catch((error) => {
        console.log("error in getPortfolioItems", error);
      });
  };

  useEffect(() => {
    getPortfolioItems();
  }, []);

  return (
    <div className="manager-wrapper">
      <div className="left-column">
        <PortfolioForm
          handleSuccessfulFormSubmission={handleSuccessfulFormSubmission}
          handleFormSubmissionError={handleFormSubmissionError}
        />
      </div>

      <div className="right-column">
        <PortfolioSidebarList
          handleDeleteClick={handleDeleteClick}
          data={portfolioItems}
        />
      </div>
    </div>
  );
};

export default PortfolioManager;
