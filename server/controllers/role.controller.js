import Role from '../models/role.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getRoles = async (req, res) => {
    try {
        const { page, limit, search, sortBy, sortOrder } = req.query;
        
        if (page && limit) {
            const offset = (page - 1) * limit;
            const roles = await Role.findAll(limit, offset, search, sortBy, sortOrder);
            const total = await Role.countAll(search);
            
            return successResponse(res, {
                data: roles,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }, 'Roles fetched successfully');
        } else {
            const roles = await Role.findAll(null, null, search, sortBy, sortOrder);
            return successResponse(res, { data: roles }, 'Roles fetched successfully');
        }
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
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        await Role.update(id, role);
        return successResponse(res, null, 'Role updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        await Role.delete(id);
        return successResponse(res, null, 'Role deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const bulkDeleteRoles = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'No IDs provided', 400);
        }
        await Role.bulkDelete(ids);
        return successResponse(res, null, `${ids.length} roles deleted successfully`);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
