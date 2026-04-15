import api from './api.service';

const getDepartments = async () => {
    const response = await api.get('/departments');
    return response.data;
};

export default {
    getDepartments
};
