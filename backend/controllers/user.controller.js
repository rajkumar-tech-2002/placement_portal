import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createUser = async (req, res) => {
    const { name, user_id, password, role, department } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findByUserId(user_id);
        if (existingUser) {
            return errorResponse(res, 'User already exists with this identification', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        
        const newUser = await User.create({
            name,
            user_id,
            password: hashedPassword,
            role,
            department
        });

        return successResponse(res, { userId: newUser.id }, 'User created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        return successResponse(res, { data: users }, 'Users fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await User.delete(id);
        if (!deleted) {
            return errorResponse(res, 'User not found', 404);
        }
        return successResponse(res, null, 'User deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, user_id, role, department, cambus, password } = req.body;

    try {
        let updateData = { name, user_id, role, department, cambus };
        
        if (password) {
            updateData.password = await bcrypt.hash(password, 8);
        }

        const updated = await User.update(id, updateData);
        if (!updated) {
            return errorResponse(res, 'User not found or no changes made', 404);
        }

        return successResponse(res, null, 'User updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const deleteManyUsers = async (req, res) => {
    const { ids } = req.body;
    try {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'No IDs provided', 400);
        }
        await User.deleteMany(ids);
        return successResponse(res, null, `${ids.length} users deleted successfully`);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
