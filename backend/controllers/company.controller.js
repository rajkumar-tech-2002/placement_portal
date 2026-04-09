import Company from '../models/company.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createCompany = async (req, res) => {
    try {
        const newCompany = await Company.create(req.body);
        return successResponse(res, { companyId: newCompany.id, company: newCompany }, 'Company created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const updateCompany = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCompany = await Company.update(id, req.body);
        return successResponse(res, { company: updatedCompany }, 'Company updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const deleteCompany = async (req, res) => {
    const { id } = req.params;
    try {
        await Company.delete(id);
        return successResponse(res, null, 'Company deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll();
        return successResponse(res, { companies });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const getEligibleCounts = async (req, res) => {
    try {
        const companies = await Company.findAll();
        const counts = {};
        
        for (const company of companies) {
            counts[company.id] = await Company.getEligibleCount(company.id);
        }
        
        res.json(counts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCompanyById = async (req, res) => {
    const { id } = req.params;
    try {
        const company = await Company.findById(id);
        if (!company) {
            return errorResponse(res, 'Company not found', 404);
        }
        return successResponse(res, { company });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

export const getEligibleStudents = async (req, res) => {
    const { id } = req.params;
    try {
        const students = await Company.getEligibleStudents(id);
        const company = await Company.findById(id);
        return successResponse(res, { students, company, count: students.length }, 'Eligible students fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
