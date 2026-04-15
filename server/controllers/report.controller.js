import Report from '../models/report.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getPerformanceReport = async (req, res) => {
    try {
        const stats = await Report.getOverallStats();
        return successResponse(res, { stats });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const getDriveReport = async (req, res) => {
    const { drive_id } = req.params;
    try {
        const report = await Report.getDriveReport(drive_id);
        return successResponse(res, { report });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const getWillingReport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const department = req.query.department || '';
        const domain = req.query.domain || '';
        
        let campus = req.query.campus || [];
        if (typeof campus === 'string') {
            campus = [campus];
        }

        const { rows, total } = await Report.getWillingStudents(limit, offset, search, campus, department, domain);
        
        return successResponse(res, { 
            report: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const getWillingFilters = async (req, res) => {
    try {
        const filters = await Report.getWillingFilterOptions();
        return successResponse(res, { filters });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};


export const getPlacedReport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const department = req.query.department || '';
        const company = req.query.company || '';
        
        let campus = req.query.campus || [];
        if (typeof campus === 'string') {
            campus = [campus];
        }

        const { rows, total } = await Report.getPlacedStudents(limit, offset, search, campus, department, company);
        
        return successResponse(res, { 
            report: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};


export const getCompanyWiseReport = async (req, res) => {
    try {
        const report = await Report.getCompanyWiseReport();
        return successResponse(res, { report });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const getPackageDistReport = async (req, res) => {
    try {
        const report = await Report.getPackageDistribution();
        return successResponse(res, { report });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
