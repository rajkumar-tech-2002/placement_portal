import Department from '../models/department.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.getAll();
        return successResponse(res, { data: departments }, 'Departments fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
