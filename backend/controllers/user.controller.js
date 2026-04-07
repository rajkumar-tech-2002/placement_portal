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
