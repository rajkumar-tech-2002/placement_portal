import api from './api.service';

export const getWillingStudents = async (driveId) => {
    const response = await api.get(`/coordinators/drive/${driveId}/students`);
    return response.data;
};

export const markAttendance = async (driveId, studentId, attended) => {
    const response = await api.post('/coordinators/mark-attendance', { drive_id: driveId, student_id: studentId, attended });
    return response.data;
};

export const updateRoundResult = async (resultData) => {
    const response = await api.post('/coordinators/update-result', resultData);
    return response.data;
};
