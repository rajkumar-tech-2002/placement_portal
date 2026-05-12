import PlacementCount from '../models/placementCount.model.js';
import { successResponse, errorResponse } from '../utils/response.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for signature uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/signature';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { campus, department } = req.body;
        // Safety check to prevent crash if body is not yet populated
        if (!campus || !department) {
            return cb(new Error('Missing campus or department metadata'));
        }
        const baseDept = department.split(' - ')[0].trim();
        const ext = path.extname(file.originalname);
        cb(null, `${campus}_${baseDept}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
}).single('signature');

export const getAllPlacementCounts = async (req, res) => {
    try {
        let campus = null;
        let department = null;

        // Coordinators and non-admins only see their own campus/department
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER ADMIN') {
            campus = req.user.campus;
            department = req.user.department;
        } else {
            // Admins see everything unless they are restricted to a campus
            campus = req.user.campus !== 'Both' ? req.user.campus : null;
        }

        const counts = await PlacementCount.getAll(campus, department);
        
        // Fetch willing counts for coordinators to enable/disable tabs
        let willingCounts = { core_willing_count: 0, both_willing_count: 0 };
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER ADMIN' && department) {
            // Clean department name (e.g., "CSE - IT" -> "CSE") to match view
            const baseDept = department.split(' - ')[0].trim();
            const countsFromDb = await PlacementCount.getWillingCounts(campus, baseDept);
            if (countsFromDb) {
                willingCounts = {
                    core_willing_count: Number(countsFromDb.core_willing_count || 0),
                    both_willing_count: Number(countsFromDb.both_willing_count || 0)
                };
            }
        }

        return successResponse(res, { data: counts, willingCounts });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const updatePlacementCounts = async (req, res) => {
    const { id } = req.params;
    try {
        await PlacementCount.updateCounts(id, req.body);
        const updated = await PlacementCount.findById(id);
        return successResponse(res, { data: updated }, 'Placement counts updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const uploadSignature = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return errorResponse(res, err.message);
        }
        if (!req.file) {
            return errorResponse(res, 'No file uploaded');
        }

        const { campus, department } = req.body;
        const baseDept = department.split(' - ')[0].trim();
        const signaturePath = `/uploads/signature/${req.file.filename}`;

        try {
            await PlacementCount.updateSignature(campus, baseDept, signaturePath);
            return successResponse(res, { signaturePath }, 'Signature uploaded and updated successfully');
        } catch (error) {
            return errorResponse(res, error.message);
        }
    });
};
