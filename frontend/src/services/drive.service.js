import api from './api.service';

export const createDrive = async (driveData) => {
    const response = await api.post('/drives', driveData);
    return response.data;
};

export const getDrives = async () => {
    const response = await api.get('/drives');
    return response.data;
};

export const getDriveDetails = async (id) => {
    const response = await api.get(`/drives/${id}`);
    return response.data;
};
