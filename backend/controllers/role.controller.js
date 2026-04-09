import Role from '../models/role.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        return successResponse(res, { data: roles }, 'Roles fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const createRole = async (req, res) => {
    const { role } = req.body;
    try {
        if (!role) {
            return errorResponse(res, 'Role name is required', 400);
        }
        
        const newRole = await Role.create(role);
        return successResponse(res, newRole, 'Role created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
