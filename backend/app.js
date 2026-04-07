import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.routes.js';
import companyRoutes from './routes/company.routes.js';
import reportRoutes from './routes/report.routes.js';
import studentPlacementRoutes from './routes/studentPlacement.routes.js';
import departmentRoutes from './routes/department.routes.js';
import staffRoutes from './routes/staff.routes.js';
import userRoutes from './routes/user.routes.js';
import driveWillingnessRoutes from './routes/driveWillingness.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Placement Management System (PMS) API' });
});

// Base API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/student-placements', studentPlacementRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drive-willingness', driveWillingnessRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

export default app;
