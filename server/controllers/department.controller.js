import Department from '../models/department.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getDepartments = async (req, res) => {
    try {
        const { campus, page, limit, search, sortBy, sortOrder } = req.query;
        
        if (page && limit) {
            const offset = (page - 1) * limit;
            const departments = await Department.getAll(limit, offset, search, sortBy, sortOrder, campus);
            const total = await Department.countAll(search, campus);
            
            return successResponse(res, {
                data: departments,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }, 'Departments fetched successfully');
        } else {
            const departments = await Department.getAll(null, null, search, sortBy, sortOrder, campus);
            return successResponse(res, { data: departments }, 'Departments fetched successfully');
        }
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

export const bulkDeleteDepartments = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'No IDs provided', 400);
        }
        await Department.bulkDelete(ids);
        return successResponse(res, null, `${ids.length} departments deleted successfully`);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
