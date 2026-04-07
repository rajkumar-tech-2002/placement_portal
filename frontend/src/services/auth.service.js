import api from './api.service';

export const login = async (userId, password, campus) => {
    const response = await api.post('/auth/login', { userId, password, campus });
    if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    // Clear any other potential auth-related items
    sessionStorage.clear();
    // If there were cookies, we would clear them here, but backend doesn't seem to use them.
};

export const getCurrentUser = () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
