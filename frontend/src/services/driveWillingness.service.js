import api from './api.service';

export const getCoordinatorDrives = async () => {
    const response = await api.get('/drive-willingness/drives');
    return response.data;
};

export const getDriveAttendance = async (companyId) => {
    const response = await api.get(`/drive-willingness/drives/${companyId}/attendance`);
    return response.data;
};

export const getWillingStudents = async (companyId) => {
    const response = await api.get(`/drive-willingness/drives/${companyId}/willing`);
    return response.data;
};

export const markWillingness = async (data) => {
    const response = await api.post('/drive-willingness/mark-willingness', data);
    return response.data;
};
