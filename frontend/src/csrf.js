// CSRF helper (optional)
// Purpose: allow this frontend to work with both the insecure backend (no CSRF) and the secure backend (cookie-based CSRF).
import axios from 'axios';

// Required when the secure backend uses cookie-based CSRF (`csurf`).
axios.defaults.withCredentials = true;

export async function maybeGetCsrfToken() {
  try {
    const res = await axios.get('/csrf-token');
    return res.data?.csrfToken || null;
  } catch {
    // In insecure mode there is no CSRF endpoint; treat it as "no token".
    return null;
  }
}
