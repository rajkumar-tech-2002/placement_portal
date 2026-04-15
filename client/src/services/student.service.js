import api from './api.service';

export const updateProfile = async (profileData) => {
    const response = await api.post('/students/profile', profileData);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/students/profile');
    return response.data;
};

export const getEligibleDrives = async () => {
    const response = await api.get('/students/eligible-drives');
    return response.data;
};

export const submitWillingness = async (driveId, willingness) => {
    const response = await api.post('/students/submit-willingness', { drive_id: driveId, willingness });
    return response.data;
};
