import Staff from '../models/staff.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getStaff = async (req, res) => {
    try {
        const staff = await Staff.getAll();
        return successResponse(res, { data: staff }, 'Staff members fetched successfully');
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
