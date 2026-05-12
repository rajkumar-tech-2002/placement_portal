import api from './api.service';

export const login = async (userId, password, campus) => {
    const response = await api.post('/auth/login', { userId, password, campus });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // We specifically avoid localStorage.clear() to preserve theme and other UI preferences
};

export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
