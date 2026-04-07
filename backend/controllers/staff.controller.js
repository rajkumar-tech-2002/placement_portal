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
