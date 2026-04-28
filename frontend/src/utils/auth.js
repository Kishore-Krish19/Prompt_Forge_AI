export const isAuthenticated = () => {
  try {
    return !!localStorage.getItem('token');
  } catch (e) {
    return false;
  }
};

export const saveAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const clearAuth = () => {
  localStorage.removeItem('token');
};

export const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (e) {
    return null;
  }
};

export const isAdmin = () => {
  try {
    const u = getUserFromToken();
    return !!(u && (u.is_admin || u.role === 'admin'));
  } catch (e) {
    return false;
  }
};
