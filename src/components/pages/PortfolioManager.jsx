import { useState, useEffect } from "react";
import axios from "axios";
import PortfolioSidebarList from "../portfolio/PortfolioSidebarList";
import PortfolioForm from "../portfolio/PortfolioForm";

const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);

  const handleDeleteClick = (portfolioItem) => {
    axios
      .delete(
        `https://marina-backend.onrender.com/portfolio/${portfolioItem._id.$oid}`
      )
      .then(() => {
        setPortfolioItems((prevItems) =>
          prevItems.filter((item) => item._id.$oid !== portfolioItem._id.$oid)
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
    axios
      .get("https://marina-backend.onrender.com/portfolio")
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
