import api from './api.service';

export const savePlacementDetail = async (data) => {
    const response = await api.post('/student-placements/placement-detail', data);
    return response.data;
};

export const getAllStudentsForSelection = async (params = {}) => {
    const response = await api.get('/student-placements', {
        params: { limit: 100, ...params }
    });
    return response.data;
};

export const getAllPlacementDetails = async (params = {}) => {
    const response = await api.get('/student-placements/placement-details', { params });
    return response.data;
};

export const updatePlacementDetail = async (id, data) => {
    const response = await api.put(`/student-placements/placement-details/${id}`, data);
    return response.data;
};

export const deletePlacementDetail = async (id) => {
    const response = await api.delete(`/student-placements/placement-details/${id}`);
    return response.data;
};
