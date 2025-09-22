import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import http from "../../api/http";
import InventoryForm from "../shop/InventoryForm";
import InventorySidebarList from "../shop/InventorySidebarList";

const InventoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both the specific product and all products for sidebar
        const [productResponse, allProductsResponse] = await Promise.all([
          http.get(`/store/${id}`),
          http.get('/store')
        ]);
        
        setProduct(productResponse.data);
        setProducts(allProductsResponse.data);
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
    navigate("/inventory-manager");
  };

  const handleUpdateError = (error) => {
    setError(error?.response?.data?.error || "Error al actualizar el producto");
  };

  const handleCancel = () => {
    navigate("/inventory-manager");
  };

  const handleDeleteClick = (product) => {
    const id = product._id && product._id.$oid ? product._id.$oid : product._id;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      http.delete(`/store/${id}`)
        .then(() => {
          // Remove from local state
          setProducts(prev => prev.filter(item => {
            const itemId = item._id && item._id.$oid ? item._id.$oid : item._id;
            return itemId !== id;
          }));
          
          // If we're editing the deleted item, go back to inventory manager
          const currentId = product._id && product._id.$oid ? product._id.$oid : product._id;
          if (currentId === id) {
            navigate("/inventory-manager");
          }
        })
        .catch((err) => {
          setError(err?.response?.data?.error || "Error al eliminar el producto");
        });
    }
  };

  if (loading) {
    return (
      <div className="manager-wrapper">
        <div className="left-column">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando producto...</p>
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

  if (error && !product) {
    return (
      <div className="manager-wrapper">
        <div className="left-column">
          <div className="error-state">
            <p>{error}</p>
            <button className="btn" onClick={() => navigate("/inventory-manager")}>
              Volver al Inventory Manager
            </button>
          </div>
        </div>
        <div className="right-column">
          <InventorySidebarList 
            data={products} 
            onDeleteClick={handleDeleteClick} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="manager-wrapper">
      <div className="left-column">
        <InventoryForm
          onSuccessfulSubmission={handleSuccessfulUpdate}
          onFormSubmissionError={handleUpdateError}
          editMode={true}
          initialData={product}
          onCancel={handleCancel}
        />
        {error && <div className="error">{error}</div>}
      </div>
      <div className="right-column">
        <div className="sidebar-header">
          <h3>Productos</h3>
          <small>Editando: {product?.name}</small>
        </div>
        <InventorySidebarList 
          data={products} 
          onDeleteClick={handleDeleteClick}
          onReorder={(reorderedItems) => setProducts(reorderedItems)}
        />
      </div>
    </div>
  );
};

export default InventoryEdit;
