/**
 * Format price in euros
 * @param {number} euros - Price in euros
 * @returns {string} Formatted price string
 */
export function formatPrice(euros) {
  return (euros / 100).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR"
  });
}

