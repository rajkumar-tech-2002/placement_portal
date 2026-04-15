import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.user = {
            id: decoded.id,
            userId: decoded.userId,
            role: decoded.role,
            campus: decoded.campus,
            department: decoded.department
        };
        next();
    });
};

export const isAdmin = (req, res, next) => {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Require Admin Role' });
    }
    next();
};

export const isCoordinator = (req, res, next) => {
    if (req.userRole !== 'COORDINATOR' && req.userRole !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Require Coordinator or Admin Role' });
    }
    next();
};
