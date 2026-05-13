import Department from '../models/department.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getDepartments = async (req, res) => {
    try {
        const { campus } = req.query;
        const departments = await Department.getAll(campus);
        return successResponse(res, { data: departments }, 'Departments fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
export const createDepartment = async (req, res) => {
    try {
        const id = await Department.create(req.body);
        return successResponse(res, { id }, 'Department created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        await Department.update(id, req.body);
        return successResponse(res, null, 'Department updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        await Department.delete(id);
        return successResponse(res, null, 'Department deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
