import { useEffect, useState } from "react";
import http from "../../api/http";
import InventoryForm from "../shop/InventoryForm";
import InventorySidebarList from "../shop/InventorySidebarList";

function InventoryManager() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const fetchItems = () => {
    http
      .get("/store")
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSuccess = (newItem) => {
    if (newItem) {
      setItems((prev) => [newItem, ...prev]);
    } else {
      fetchItems();
    }
  };

  const handleError = (msg) => setError(msg || "");

  const handleDelete = (product) => {
    const id = product._id && product._id.$oid ? product._id.$oid : product._id;
    if (!id) return;
    http
      .delete(`/store/${id}`)
      .then(() => {
        setItems((prev) => prev.filter((it) => {
          const itId = it._id && it._id.$oid ? it._id.$oid : it._id;
          return itId !== id;
        }));
      })
      .catch((err) => setError(err?.response?.data?.error || "No se pudo eliminar"));
  };

  return (
    <div className="manager-wrapper">
      <div className="left-column">
        <InventoryForm onSuccessfulSubmission={handleSuccess} onFormSubmissionError={handleError} />
        {error && <div className="error">{error}</div>}
      </div>
      <div className="right-column">
        <InventorySidebarList data={items} onDeleteClick={handleDelete} />
      </div>
    </div>
  );
}

export default InventoryManager;