import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import http from "../../api/http";
import PortfolioForm from "../portfolio/PortfolioForm";
import PortfolioSidebarList from "../portfolio/PortfolioSidebarList";

const PortfolioEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolioItem, setPortfolioItem] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both the specific portfolio item and all items for sidebar
        const [itemResponse, allItemsResponse] = await Promise.all([
          http.get(`/portfolio/${id}`),
          http.get('/portfolio')
        ]);
        
        setPortfolioItem(itemResponse.data);
        setPortfolioItems(allItemsResponse.data);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSuccessfulUpdate = () => {
    navigate("/portfolio-manager");
  };

  const handleUpdateError = (error) => {
    setError(error?.response?.data?.error || "Error al actualizar el álbum");
  };

  const handleDeleteClick = (portfolioItem) => {
    const id = typeof portfolioItem._id === 'object' ? portfolioItem._id.$oid : portfolioItem._id;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${portfolioItem.name}"?`)) {
      http.delete(`/portfolio/${id}`)
        .then(() => {
          // Remove from local state
          setPortfolioItems(prev => prev.filter(item => {
            const itemId = typeof item._id === 'object' ? item._id.$oid : item._id;
            return itemId !== id;
          }));
          
          // If we're editing the deleted item, go back to portfolio manager
          const currentId = typeof portfolioItem._id === 'object' ? portfolioItem._id.$oid : portfolioItem._id;
          if (currentId === id) {
            navigate("/portfolio-manager");
          }
        })
        .catch((err) => {
          setError(err?.response?.data?.error || "Error al eliminar el álbum");
        });
    }
  };

  if (loading) {
    return (
      <div className="manager-wrapper">
        <div className="left-column">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando álbum...</p>
          </div>
        </div>
        <div className="right-column">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando lista...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !portfolioItem) {
    return (
      <div className="manager-wrapper">
        <div className="left-column">
          <div className="error-state">
            <p>{error}</p>
            <button className="btn" onClick={() => navigate("/portfolio-manager")}>
              Volver al Portfolio Manager
            </button>
          </div>
        </div>
        <div className="right-column">
          <PortfolioSidebarList 
            data={portfolioItems} 
            handleDeleteClick={handleDeleteClick} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="manager-wrapper">
      <div className="left-column">
        <PortfolioForm
          handleSuccessfulFormSubmission={handleSuccessfulUpdate}
          handleFormSubmissionError={handleUpdateError}
          editMode={true}
          initialData={portfolioItem}
        />
        {error && <div className="error">{error}</div>}
      </div>
      <div className="right-column">
        <div className="sidebar-header">
          <h3>Álbumes</h3>
          <small>Editando: {portfolioItem?.name}</small>
        </div>
        <PortfolioSidebarList 
          data={portfolioItems} 
          handleDeleteClick={handleDeleteClick} 
        />
      </div>
    </div>
  );
};

export default PortfolioEdit;
