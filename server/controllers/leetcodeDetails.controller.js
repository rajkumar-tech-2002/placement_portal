import LeetCodeDetail from '../models/leetcodeDetails.model.js';
import { extractUsername, fetchLeetCodeData, delay } from '../utils/leetcodeFetcher.js';
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

        const allowedColumns = await LeetCodeDetail.getTemplateColumns();

        for (const record of records) {
            try {
                if (!record.reg_no) {
                    errors.push('Missing reg_no for a record');
                    continue;
                }

                // Strictly filter the record data to only include allowed template columns
                const filteredRecord = {};
                allowedColumns.forEach(col => {
                    if (record[col] !== undefined) {
                        filteredRecord[col] = record[col];
                    }
                });

                const result = await LeetCodeDetail.upsert(filteredRecord);
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

// --- SYNC LOGIC ---

let isSyncRunning = false;

export const syncAllDetails = async (req, res) => {
    if (isSyncRunning) {
        if (res) return res.status(400).json({ message: 'Sync already in progress' });
        return;
    }

    try {
        // Fetch ALL details that have either a username or a profile URL
        const details = await LeetCodeDetail.getAll();
        const recordsToSync = details.filter(d => d.leetcode_username || d.leet_code_profile);

        if (recordsToSync.length === 0) {
            if (res) return res.json({ message: 'No records found with LeetCode profile URLs' });
            return;
        }

        // Start background sync
        isSyncRunning = true;
        if (res) res.json({ message: 'Sync started in background', total: recordsToSync.length });

        // Background loop
        (async () => {
            console.log(`[SYNC STARTED] Total records: ${recordsToSync.length}`);
            for (const record of recordsToSync) {
                try {
                    // Throttling: Skip if synced less than 6 hours ago
                    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
                    const isRecentlySynced = record.last_synced_at && new Date(record.last_synced_at) > sixHoursAgo;
                    
                    // IF it was synced recently AND it already has total_questions, skip it.
                    // IF it doesn't have total_questions, sync it anyway to backfill data.
                    if (isRecentlySynced && (record.total_questions > 0)) {
                        continue;
                    }

                    await syncSingleRecord(record);
                    await delay(3000); // 3s delay between students
                } catch (err) {
                    console.error(`[SYNC FAILED] ${record.reg_no}: ${err.message}`);
                }
            }
            isSyncRunning = false;
            console.log('[SYNC COMPLETED]');
        })();

    } catch (error) {
        isSyncRunning = false;
        if (res) res.status(500).json({ message: error.message });
        else console.error(`[CRON SYNC FAILED] ${error.message}`);
    }
};

export const syncDetailById = async (req, res) => {
    try {
        const record = await LeetCodeDetail.getById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        
        if (!record.leet_code_profile) {
            return res.status(400).json({ message: 'No profile URL found for this record' });
        }

        await syncSingleRecord(record);
        const updatedRecord = await LeetCodeDetail.getById(req.params.id);
        res.json({ message: 'Sync successful', data: updatedRecord });
    } catch (error) {
        res.status(500).json({ message: `Sync failed: ${error.message}` });
    }
};

/**
 * Helper to sync a single student record
 */
async function syncSingleRecord(record) {
    const username = record.leetcode_username || extractUsername(record.leet_code_profile);
    
    if (!username) {
        await LeetCodeDetail.update(record.id, {
            sync_status: 'FAILED',
            error_message: 'Neither LeetCode Username nor Profile URL provided',
            updated_at: new Date()
        });
        return;
    }

    try {
        await LeetCodeDetail.update(record.id, { sync_status: 'IN_PROGRESS' });
        
        const data = await fetchLeetCodeData(username);
        
        await LeetCodeDetail.update(record.id, {
            leetcode_username: data.username,
            total_solved: data.totalSolved,
            total_questions: data.totalQuestions,
            easy_solved: data.easySolved,
            medium_solved: data.mediumSolved,
            hard_solved: data.hardSolved,
            total_easy: data.totalEasy,
            total_medium: data.totalMedium,
            total_hard: data.totalHard,
            contest_rating: data.contestRating,
            global_ranking: data.globalRanking,
            leet_rank: data.ranking,
            last_contest_name: data.lastContestName,
            last_contest_date: data.lastContestDate,
            last_contest_rank: data.lastContestRank,
            last_contest_solved: data.lastContestSolved,
            last_contest_total_questions: data.lastContestTotal,
            total_participants: data.totalParticipants,
            last_synced_at: new Date(),
            sync_status: 'SUCCESS',
            error_message: null,
            updated_at: new Date()
        });
        console.log(`[SYNC SUCCESS] ${record.reg_no} (${username})`);
    } catch (err) {
        await LeetCodeDetail.update(record.id, {
            sync_status: 'FAILED',
            error_message: err.message,
            updated_at: new Date()
        });
        throw err;
    }
}

export const getEligibleDetails = async (req, res) => {
    try {
        const minSolved = parseInt(req.query.minSolved) || 0;
        const minRating = parseInt(req.query.minRating) || 0;
        
        // We'll reuse the getAll logic but add specific filters
        // For simplicity, we can fetch all and filter, or add to model
        // Better to add to model, but for now we'll fetch all and filter in controller
        // since the dataset is usually manageable (few hundreds/thousands)
        
        const details = await LeetCodeDetail.getAll(null, null, '', 'total_solved', 'DESC');
        const filtered = details.filter(d => 
            (d.total_solved || 0) >= minSolved && 
            (d.contest_rating || 0) >= minRating
        );

        res.json({
            data: filtered,
            total: filtered.length,
            criteria: { minSolved, minRating }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSyncStatus = (req, res) => {
    res.json({ isSyncRunning });
};
