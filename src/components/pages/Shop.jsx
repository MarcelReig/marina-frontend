
import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import Header from "../shop/Header";
import Product from "../shop/Product";
import Order from "../shop/Order";
import SkeletonShop from "../skeletons/SkeletonShop";

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
  };

  const removeFromOrder = (key) => {
    setOrder((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
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
        <Order products={productsMap} order={order} onRemoveFromOrder={removeFromOrder} />
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
      <Order products={productsMap} order={order} onRemoveFromOrder={removeFromOrder} />
    </div>
  );
}

export default Shop;