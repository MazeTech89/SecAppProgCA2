// CSRF helper
// Purpose: fetch and cache a CSRF token from the backend so state-changing requests can include `X-CSRF-Token`.
import axios from 'axios';
let csrfToken = null;

// Required for cookie-based CSRF (`csurf`): browser must send/receive cookies.
axios.defaults.withCredentials = true;

export async function getCsrfToken() {
  // Fetch a fresh token each time.
  // This avoids stale token/cookie mismatches when the backend restarts during development.
  try {
    const res = await axios.get('/csrf-token');
    csrfToken = res.data.csrfToken;
    return csrfToken;
  } catch (err) {
    csrfToken = null;
    throw err;
  }
}
