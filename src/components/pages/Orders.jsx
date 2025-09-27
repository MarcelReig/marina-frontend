import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import { formatPrice } from "../../utils/formatPrice";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [hasNext, setHasNext] = useState(false);

  const load = () => {
    let cancelled = false;
    setIsLoading(true);
    http
      .get(`/store/orders?page=${page}&limit=${limit + 1}`)
      .then((res) => {
        if (cancelled) return;
        const arr = Array.isArray(res?.data) ? res.data : [];
        setHasNext(arr.length > limit);
        setOrders(arr.slice(0, limit));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.response?.data?.error || e?.message || "No se pudo cargar");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    const cleanup = load();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTs = dateTo ? new Date(dateTo + "T23:59:59").getTime() : null;
    return (orders || []).filter((o) => {
      const createdRaw = o.created_at?.$date || o.created_at;
      const createdTs = createdRaw ? new Date(createdRaw).getTime() : 0;
      if (fromTs && createdTs < fromTs) return false;
      if (toTs && createdTs > toTs) return false;
      if (!q) return true;
      const email = (o.customer_email || "").toLowerCase();
      const sid = (o.session_id || "").toLowerCase();
      const itemsText = (o.items || []).map((i) => i.description || "").join(" ").toLowerCase();
      return email.includes(q) || sid.includes(q) || itemsText.includes(q);
    });
  }, [orders, query, dateFrom, dateTo]);

  return (
    <div className="orders-page">
      <h2>
        Pedidos
        <button className="btn" type="button" onClick={() => load()} disabled={isLoading}>
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </h2>
      <p>
        Vista de solo lectura de los pedidos más recientes. Usa el buscador y los filtros de fecha para acotar resultados.
      </p>
      <div className="orders-toolbar">
        <input
          type="text"
          placeholder="Buscar (email, sesión, artículo)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label>
          Desde
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
        <label>
          Por página
          <select value={limit} onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value || '20', 10)); }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
      {error && <div className="error">{error}</div>}
      {isLoading ? (
        <div>Cargando...</div>
      ) : filtered.length === 0 ? (
        <div>No hay pedidos aún.</div>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Moneda</th>
                <th className="text-right">Total</th>
                <th>Items</th>
                <th>Sesión</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const id = o._id?.$oid || o._id;
                const created = o.created_at?.$date || o.created_at;
                const date = created ? new Date(created).toLocaleString() : "";
                const total = typeof o.amount_total_minor === 'number' ? (o.amount_total_minor / 100) : 0;
                const status = (o.payment_status || '').toUpperCase();
                return (
                  <tr key={id}>
                    <td>{date}</td>
                    <td>{o.customer_email || '-'}</td>
                    <td>
                      <span className={`status-badge ${status === 'PAID' || status === 'SUCCEEDED' ? 'ok' : 'pending'}`}>{status || '—'}</span>
                    </td>
                    <td>{(o.currency || 'eur').toUpperCase()}</td>
                    <td className="text-right">{formatPrice(total)}</td>
                    <td>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Cant.</th>
                            <th>Artículo</th>
                            <th className="subtotal">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(o.items || []).map((it, idx) => (
                            <tr key={idx}>
                              <td>{it.quantity}</td>
                              <td>{it.description}</td>
                              <td className="subtotal">
                                {formatPrice((it.amount_total_minor || 0) / 100)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                    <td className="session-cell" title={o.session_id}>{o.session_id}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="orders-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <div>Página {page}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
              <button className="btn" type="button" disabled={!hasNext || isLoading} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
