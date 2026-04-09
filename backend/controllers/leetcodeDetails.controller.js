import LeetCodeDetail from '../models/leetcodeDetails.model.js';
import { Parser } from 'json2csv';
import { parse } from 'csv-parse/sync';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
export const uploadMiddleware = upload.single('file');

export const getAllDetails = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder || 'DESC';
        
        let campus = req.query.campus || [];
        if (typeof campus === 'string') campus = [campus];

        let department = null;
        if (req.userRole === 'COORDINATOR') {
            department = req.user.department;
            // If coordinator, they can only see their campus if it's not already filtered
            if (campus.length === 0 && req.user.campus) {
                campus = [req.user.campus];
            } else if (campus.length > 0 && req.user.campus && !campus.includes(req.user.campus)) {
                // If they try to filter for another campus, force theirs
                campus = [req.user.campus];
            }
        }

        const [details, total] = await Promise.all([
            LeetCodeDetail.getAll(limit, offset, search, sortBy, sortOrder, campus, department),
            LeetCodeDetail.countAll(search, campus, department)
        ]);

        res.json({
            data: details,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDetailById = async (req, res) => {
    try {
        const detail = await LeetCodeDetail.getById(req.params.id);
        if (!detail) return res.status(404).json({ message: 'Record not found' });
        res.json(detail);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createDetail = async (req, res) => {
    try {
        const id = await LeetCodeDetail.create(req.body);
        res.status(201).json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDetail = async (req, res) => {
    try {
        await LeetCodeDetail.update(req.params.id, req.body);
        res.json({ message: 'Record updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDetail = async (req, res) => {
    try {
        await LeetCodeDetail.delete(req.params.id);
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteManyDetails = async (req, res) => {
    try {
        const { ids } = req.body;
        await LeetCodeDetail.deleteMany(ids);
        res.json({ message: 'Records deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const exportTemplate = async (req, res) => {
    try {
        const columns = await LeetCodeDetail.getTemplateColumns();
        const json2csvParser = new Parser({ fields: columns });
        const csv = json2csvParser.parse([]);
        
        res.header('Content-Type', 'text/csv');
        res.attachment('leetcode_import_template.csv');
        return res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const importDetails = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const records = parse(req.file.buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        let inserted = 0;
        let updated = 0;
        let errors = [];

        for (const record of records) {
            try {
                if (!record.reg_no) {
                    errors.push('Missing reg_no for a record');
                    continue;
                }
                const result = await LeetCodeDetail.upsert(record);
                if (result.action === 'inserted') inserted++;
                else updated++;
            } catch (err) {
                errors.push(`Error with reg_no ${record.reg_no}: ${err.message}`);
            }
        }

        res.json({
            message: 'Import completed',
            summary: {
                total: records.length,
                inserted,
                updated,
                failed: errors.length
            },
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
