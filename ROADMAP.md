# Roadmap Marina (ES)

Este roadmap resume lo HECHO y lo PENDIENTE para llevar la tienda a producción con Stripe.

## Estado actual
- [x] API Flask (portfolio, store CRUD, reorder)
- [x] Subida de imágenes (Cloudinary)
- [x] Autenticación (JWT) + guard de admin
- [x] Stripe Checkout (sesión creada en servidor)
- [x] Webhook de Stripe (`checkout.session.completed`) guardando pedidos en MongoDB
- [x] Endpoint admin para listar pedidos (`GET /api/store/orders`)
- [x] Página de Pedidos en el frontend (filtros, tabla, limpieza de UI)
- [x] Redirects para SPA en Netlify; CORS configurado para prod

## Fase 1 – Seguridad de precios y visibilidad del pedido (en curso)
- [x] Seguridad de precios: calcular importes en el servidor a partir de `productId` (o usar `stripe price_id`)
- [x] Páginas de éxito/cancelación; vaciar carrito en éxito
- [ ] Página de confirmación de pedido (mostrar resumen)
- [ ] Webhook en producción con `STRIPE_WEBHOOK_SECRET` configurado y monitorizado (respuestas 2xx)
- [x] Paginación en /orders
- [ ] Exportación CSV

## Fase 2 – Gestión de productos y catálogo en Stripe
- [ ] Crear productos desde el admin (React) → guardar en Mongo y (opcional) crear Producto/Precio en Stripe
  - [ ] Guardar `stripe_product_id` y `stripe_price_id` en cada ítem
  - [ ] Endpoint backend para crear/actualizar producto/precio en Stripe
  - [ ] Usar `price_id` en `line_items` de Checkout
- [ ] Campo de stock y validaciones de disponibilidad

## Fase 3 – Datos de cliente durante checkout
- [ ] Recoger email/teléfono/dirección de envío vía configuración de Stripe Checkout
  - [ ] Activar `shipping_address_collection` y campos de contacto
  - [ ] Persistir dirección y teléfono en `orders` desde el webhook
- [ ] Página de confirmación con resumen (por `session_id` o query params)
- [ ] Emails de notificación (comprador y propietario del sitio)

## Fase 4 – Cuentas de cliente (opcional, decisión de negocio)
- Opción A (solo invitado/guest)
  - [ ] Sin login de cliente; Stripe recoge los datos; histórico visible por email en admin
- Opción B (con cuentas)
  - [ ] Alta/login de cliente
  - [ ] Página “Mi cuenta”: historial de pedidos
  - [ ] GDPR: borrar/exportar datos

## Fase 5 – Operaciones y UX
- [ ] Vista de detalle de pedido en admin + timeline (pagado, preparado, enviado)
- [ ] Campos de fulfillment/estado y notas internas
- [ ] Impuestos y gastos de envío
- [ ] Observabilidad: logs estructurados + Sentry
- [ ] Tests E2E (Playwright) y API (pytest)

## Ajustes de API (plan)
- [x] Payload de Checkout: aceptar `[{ productId, quantity }]` o `[{ price_id, quantity }]`
- [x] El servidor recalcula `unit_amount` (o usa `price_id`) e ignora precios del cliente
- [x] `GET /api/store/orders`: paginación (?page, ?limit) y filtros (?email, ?from, ?to)
- [ ] `GET /api/store/orders/:session_id` para la página de éxito

## Ajustes de Frontend (plan)
- [x] Páginas `/checkout/success` y `/checkout/cancel` (limpiar carrito en success)
- [x] /orders: paginación
- [ ] /orders: copiar `session_id`
- [ ] /orders: exportar CSV
- [ ] Admin de productos: crear/editar con subida de imagen y (opcional) vinculación a Stripe

## Variables de entorno
- Backend
  - `STRIPE_SECRET_KEY` (test/prod)
  - `STRIPE_WEBHOOK_SECRET` (prod; Stripe CLI en dev)
  - `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL`
  - `MONGO_CLUSTER`, credenciales de Cloudinary
- Frontend
  - `VITE_FLASK_API_DEV_URL` / `VITE_FLASK_API_URL`
  - (Opcional) `VITE_STRIPE_PUBLISHABLE_KEY` si se usa Stripe.js

## Hitos
- M1: Seguridad de precios + páginas success/cancel + paginación en pedidos
- M2: Admin de productos ↔ catálogo en Stripe
- M3: Datos de cliente (envío/contacto) + confirmación + emails
- M4: Cuentas de cliente (opcional) + historial
- M5: Operaciones (estado, impuestos/envío), observabilidad y tests

Notas
- El checkout actual funciona; el roadmap refuerza seguridad, mejora UX y añade catálogo/operativa para llegar a calidad de producción.
