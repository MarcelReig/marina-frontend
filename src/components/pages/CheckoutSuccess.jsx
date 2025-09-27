import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import http from "../../api/http";
import { formatPrice } from "../../utils/formatPrice";

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.removeItem("marina_shop_order");
    } catch (e) {
      // Non-critical: si localStorage falla, seguimos sin bloquear la página
      console.warn("No se pudo limpiar el carrito del localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    setLoading(true);
    http
      .get(`/store/orders/by-session/${sessionId}`)
      .then((res) => {
        if (cancelled) return;
        setOrder(res?.data || null);
        const email = res?.data?.customer_email || "";
        if (email) setSubscribeEmail(email);
      })
      .catch(() => {
        if (cancelled) return;
        setOrder(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (subscribed || !subscribeEmail || !consent) return;
    setIsSubscribing(true);
    setSubscribeError("");
    try {
      await http.post('/store/subscribe', { email: subscribeEmail, source: 'checkout_success' });
      setSubscribed(true);
    } catch (err) {
      const msg = err?.response?.data?.error || 'No se pudo suscribir. Inténtalo de nuevo.';
      setSubscribeError(msg);
    } finally {
      setIsSubscribing(false);
    }
  };

  const renderSummary = () => {
    if (!order) return null;
    const orderNumber = order.order_number || "";
    const email = order.customer_email || "";
    const currency = (order.currency || "eur").toUpperCase();
    const totalMinor = typeof order.amount_total_minor === "number" ? order.amount_total_minor : 0;
    const items = order.items || [];

    // Address may exist as shipping_details (Stripe) in future; we keep summary minimal for now
    return (
      <div className="orders-table" style={{ marginTop: 12 }}>
        <table>
          <tbody>
            {orderNumber && (
              <tr>
                <td>N.º de pedido</td>
                <td><strong>{orderNumber}</strong></td>
              </tr>
            )}
            <tr>
              <td>Email</td>
              <td>{email || "—"}</td>
            </tr>
            <tr>
              <td>Moneda</td>
              <td>{currency}</td>
            </tr>
            <tr>
              <td>Total</td>
              <td>{formatPrice(totalMinor)}</td>
            </tr>
          </tbody>
        </table>
        <h3 style={{ marginTop: 16 }}>Artículos</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Artículo</th>
              <th className="subtotal">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.quantity}</td>
                <td>{it.description}</td>
                <td className="subtotal">{formatPrice(it.amount_total_minor || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="orders-page">
      <h2>¡Pago completado!</h2>
      <p>Gracias por tu compra. Recibirás un email con los detalles del pedido.</p>

      {loading ? <p>Cargando resumen…</p> : renderSummary()}

      {/* Newsletter opt-in: solo checkbox y botón si tenemos email del pedido */}
      {order?.customer_email && (
        <div style={{ marginTop: 16 }}>
          <h3>¿Quieres recibir novedades y exposiciones?</h3>
          {subscribed ? (
            <p>¡Gracias! Te hemos suscrito a nuestras novedades.</p>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label htmlFor="subscribe-consent" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  id="subscribe-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                Acepto recibir novedades por email
              </label>
              <button type="submit" className="btn" disabled={isSubscribing || !consent}>
                {isSubscribing ? 'Suscribiendo…' : 'Suscribirme'}
              </button>
              {subscribeError && <span style={{ color: 'crimson' }}>{subscribeError}</span>}
            </form>
          )}
          <small style={{ display: 'block', marginTop: 8, opacity: 0.8 }}>
            Solo te enviaremos noticias relacionadas con la obra. Puedes darte de baja en cualquier momento.
          </small>
        </div>
      )}
      <p style={{ marginTop: 16 }}>
        <Link className="btn" to="/shop">Volver a la tienda</Link>
      </p>
    </div>
  );
};

export default CheckoutSuccess;
