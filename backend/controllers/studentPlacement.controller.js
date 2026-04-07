import StudentPlacement from '../models/studentPlacement.model.js';
import { Parser } from 'json2csv';
import { parse } from 'csv-parse/sync';
import multer from 'multer';

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });
export const uploadMiddleware = upload.single('file');

export const getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder || 'DESC';
        
        // Handle campus filter - could be a single string or an array
        let campus = req.query.campus || [];
        if (typeof campus === 'string') {
            campus = [campus];
        }

        const [students, total] = await Promise.all([
            StudentPlacement.getAll(limit, offset, search, sortBy, sortOrder, campus),
            StudentPlacement.countAll(search, campus)
        ]);

        res.json({
            data: students,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentById = async (req, res) => {
    try {
        const student = await StudentPlacement.getById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createStudent = async (req, res) => {
    try {
        const id = await StudentPlacement.create(req.body);
        res.status(201).json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStudent = async (req, res) => {
    try {
        await StudentPlacement.update(req.params.id, req.body);
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        await StudentPlacement.delete(req.params.id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteManyStudents = async (req, res) => {
    try {
        const { ids } = req.body;
        await StudentPlacement.deleteMany(ids);
        res.json({ message: 'Students deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const exportTemplate = async (req, res) => {
    try {
        const columns = await StudentPlacement.getTableColumns();
        const json2csvParser = new Parser({ fields: columns });
        const csv = json2csvParser.parse([]); // Empty data, just headers
        
        res.header('Content-Type', 'text/csv');
        res.attachment('student_import_template.csv');
        return res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const importStudents = async (req, res) => {
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
                const result = await StudentPlacement.upsert(record);
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
