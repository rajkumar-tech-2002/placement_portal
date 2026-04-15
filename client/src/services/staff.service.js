import api from './api.service';

const getStaff = async () => {
    const response = await api.get('/staff');
    return response.data;
};

export default {
    getStaff
};
