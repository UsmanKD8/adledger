// Global frontend settings.
// USE_MOCK = true  -> pages run on sample data (no backend needed).
// USE_MOCK = false -> pages call the Flask REST API at API_BASE.
const CONFIG = {
  APP_NAME: 'AdLedger',
  // Port 5500 = local static server, so call the local Flask API directly.
  // Everywhere else (Flask on :5000, Vercel) the API is on the same origin at /api;
  // on Vercel, vercel.json forwards /api/* to the Render backend.
  API_BASE: location.port === '5500' ? 'http://localhost:5000/api' : '/api',
  USE_MOCK: false,
  CURRENCY: 'Rs',
};
