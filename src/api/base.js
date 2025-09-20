export const getApiBase = () => {
  const devDefault = "http://127.0.0.1:8080/api";
  const prodDefault = "https://king-prawn-app-dr5rk.ondigitalocean.app/api";

  const raw =
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_FLASK_API_DEV_URL || devDefault
      : import.meta.env.VITE_FLASK_API_URL || prodDefault;

  const trimmed = String(raw || "").replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};
