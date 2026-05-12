import api from './api.service';

const getPlacementCounts = async () => {
    const response = await api.get('/placement-count');
    return response.data;
};

const updatePlacementCounts = async (id, data) => {
    const response = await api.put(`/placement-count/${id}`, data);
    return response.data;
};

const uploadSignature = async (formData) => {
    const response = await api.post('/placement-count/upload-signature', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export default {
    getPlacementCounts,
    updatePlacementCounts,
    uploadSignature
};
