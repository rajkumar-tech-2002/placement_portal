import api from './api.service';

const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

const updateUser = async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
};

const deleteManyUsers = async (ids) => {
    const response = await api.post('/users/delete-many', { ids });
    return response.data;
};

export default {
    createUser,
    getUsers,
    deleteUser,
    updateUser,
    deleteManyUsers
};
