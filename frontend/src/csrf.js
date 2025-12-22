// Utility to fetch and cache CSRF token
import axios from 'axios';
let csrfToken = null;

export async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const res = await axios.get('http://localhost:4000/csrf-token');
  csrfToken = res.data.csrfToken;
  return csrfToken;
}
