
import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import Header from "../shop/Header";
import Product from "../shop/Product";
import Order from "../shop/Order";
import SkeletonShop from "../skeletons/SkeletonShop";
import { toast } from 'react-hot-toast';

function Shop() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState({});

  useEffect(() => {
    let cancelled = false;
    http
      .get("/store")
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Rehydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("marina_shop_order");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setOrder(parsed);
        }
      }
    } catch (_) {
      // ignore malformed storage
    }
  }, []);

  // Persist cart to localStorage when it changes
  useEffect(() => {
    try {
      window.localStorage.setItem("marina_shop_order", JSON.stringify(order || {}));
    } catch (_) {
      // storage quota errors ignored gracefully
    }
  }, [order]);

  const productsMap = useMemo(() => {
    // Normalize into map keyed by index string for simplicity
    const map = {};
    (products || []).forEach((p, idx) => {
      map[String(idx)] = p;
    });
    return map;
  }, [products]);

  const addToOrder = (key) => {
    setOrder((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    toast.success('Añadido al carrito');
  };

  const removeFromOrder = (key) => {
    setOrder((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    toast.success('Producto eliminado');
  };

  const incrementItem = (key) => {
    setOrder((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    toast.success('Cantidad aumentada');
  };

  const decrementItem = (key) => {
    setOrder((prev) => {
      const current = prev[key] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[key];
        toast.success('Producto eliminado');
        return next;
      }
      toast.success('Cantidad reducida');
      return { ...prev, [key]: current - 1 };
    });
  };

  if (isLoading) {
    return (
      <div className="marina-store">
        <div className="menu">
          <Header tagline="Mercadillo de Arte" />
          <SkeletonShop />
          <SkeletonShop />
          <SkeletonShop />
          <SkeletonShop />
          <SkeletonShop />
          <SkeletonShop />
        </div>
        <Order
          products={productsMap}
          order={order}
          onRemoveFromOrder={removeFromOrder}
          onIncrement={incrementItem}
          onDecrement={decrementItem}
        />
      </div>
    );
  }

  return (
    <div className="marina-store">
      <div className="menu">
        <Header tagline="Mercadillo de Arte" />
        <ul className="products">
          {Object.keys(productsMap).map((key) => (
            <Product key={key} index={key} details={productsMap[key]} onAddToOrder={addToOrder} />
          ))}
        </ul>
      </div>
      <Order
        products={productsMap}
        order={order}
        onRemoveFromOrder={removeFromOrder}
        onIncrement={incrementItem}
        onDecrement={decrementItem}
      />
    </div>
  );
}

export default Shop;