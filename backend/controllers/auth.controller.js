import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

dotenv.config();

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'STUDENT'
        });

        return successResponse(res, { userId: newUser.id }, 'User registered successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const login = async (req, res) => {
    const { userId, password, campus } = req.body;

    try {
        const user = await User.findByUserId(userId);
        
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return errorResponse(res, 'Invalid password', 401);
        }

        // Campus Verification for Coordinators
        if (user.role === 'COORDINATOR') {
            if (!campus) {
                return errorResponse(res, 'Please select a campus', 400);
            }
            if (user.cambus !== 'Both' && user.cambus !== campus) {
                return errorResponse(res, `You are not authorized for the ${campus} campus`, 403);
            }
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                userId: user.user_id,
                role: user.role, 
                campus: user.role === 'ADMIN' ? 'Both' : (campus || user.cambus),
                department: user.department 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return successResponse(res, {
            user: {
                id: user.id,
                name: user.name,
                userId: user.user_id,
                role: user.role,
                campus: user.role === 'ADMIN' ? 'Both' : (campus || user.cambus),
                department: user.department
            },
            token
        }, 'Login successful');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
