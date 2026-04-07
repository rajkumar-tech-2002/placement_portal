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
        const report = await Report.getWillingStudents();
        return successResponse(res, { report });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const getPlacedReport = async (req, res) => {
    try {
        const report = await Report.getPlacedStudents();
        return successResponse(res, { report });
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
