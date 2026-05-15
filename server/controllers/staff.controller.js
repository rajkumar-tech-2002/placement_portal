import Staff from '../models/staff.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getStaff = async (req, res) => {
    try {
        const { page, limit, search, sortBy, sortOrder, campus, department } = req.query;
        
        if (page && limit) {
            const offset = (page - 1) * limit;
            const staff = await Staff.getAll(limit, offset, search, sortBy, sortOrder, campus, department);
            const total = await Staff.countAll(search, campus, department);
            
            return successResponse(res, {
                data: staff,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }, 'Staff members fetched successfully');
        } else {
            const staff = await Staff.getAll(null, null, search, sortBy, sortOrder, campus, department);
            return successResponse(res, { data: staff }, 'Staff members fetched successfully');
        }
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
export const createStaff = async (req, res) => {
    try {
        const id = await Staff.create(req.body);
        return successResponse(res, { id }, 'Staff created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        await Staff.update(id, req.body);
        return successResponse(res, null, 'Staff updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        await Staff.delete(id);
        return successResponse(res, null, 'Staff deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const bulkDeleteStaff = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'No IDs provided', 400);
        }
        await Staff.bulkDelete(ids);
        return successResponse(res, null, `${ids.length} staff members deleted successfully`);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
