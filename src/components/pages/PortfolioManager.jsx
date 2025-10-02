import { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import http from "../../api/http";
import PortfolioSidebarList from "../portfolio/PortfolioSidebarList";
import PortfolioForm from "../portfolio/PortfolioForm";
import ManagerTabs from "../shared/ManagerTabs";


const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [activeTab, setActiveTab] = useState("create");

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
        toast.success('Álbum eliminado');
      })
      .catch((error) => {
        const msg = error?.response?.data?.error || 'No se pudo eliminar';
        console.log("delete error", error);
        toast.error(msg);
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

  const handleReorder = (reorderedItems) => {
    // Update local state with reordered items
    setPortfolioItems(reorderedItems);
  };

  useEffect(() => {
    getPortfolioItems();
  }, []);

  return (
    <>
      <ManagerTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        createLabel="Crear Álbum"
        listLabel="Mis Álbumes"
      />
      <div className="manager-wrapper" data-active-tab={activeTab}>
        <div className="left-column">
          <PortfolioForm
            handleSuccessfulFormSubmission={(item) => {
              handleSuccessfulFormSubmission(item);
              // Switch to list tab on mobile after successful creation
              if (window.innerWidth < 768) {
                setActiveTab("list");
              }
            }}
            handleFormSubmissionError={handleFormSubmissionError}
          />
        </div>

        <div className="right-column">
          <PortfolioSidebarList
            handleDeleteClick={handleDeleteClick}
            data={portfolioItems}
            onReorder={handleReorder}
          />
        </div>
      </div>
    </>
  );
};

export default PortfolioManager;
