/**
 * Format price in euros
 * @param {number} minorUnits - Price in minor units (cents)
 * @returns {string} Formatted price string
 */
export function formatPrice(minorUnits) {
  return (minorUnits / 100).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });
}
