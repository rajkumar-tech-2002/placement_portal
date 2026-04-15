import api from './api.service';

const getRoles = async () => {
    const response = await api.get('/roles');
    return response.data;
};

const createRole = async (roleName) => {
    const response = await api.post('/roles', { role: roleName });
    return response.data;
};

export default {
    getRoles,
    createRole
};
