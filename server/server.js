import app from './app.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { syncAllDetails } from './controllers/leetcodeDetails.controller.js';
import SyncSetting from './models/syncSetting.model.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

let leetcodeSyncJob = null;

const initializeLeetCodeSync = async () => {
    try {
        const settings = await SyncSetting.getByName('leetcode');
        
        if (!settings || !settings.is_active) {
            console.log('[CRON] LeetCode sync is disabled or not configured in DB.');
            if (leetcodeSyncJob) leetcodeSyncJob.stop();
            return;
        }

        const { sync_day, sync_time } = settings;
        const [hour, minute] = sync_time.split(':');
        
        const dayMap = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
            'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        
        const dayNum = dayMap[sync_day] !== undefined ? dayMap[sync_day] : '*';
        
        const cronExpression = `${parseInt(minute)} ${parseInt(hour)} * * ${dayNum}`;

        if (leetcodeSyncJob) {
            leetcodeSyncJob.stop();
        }

        leetcodeSyncJob = cron.schedule(cronExpression, () => {
            console.log(`[CRON] ${new Date().toLocaleString()}: Starting automated LeetCode sync...`);
            syncAllDetails(null, null);
        });

        console.log(`[CRON] LeetCode sync scheduled: ${cronExpression} (${sync_day} at ${sync_time})`);
    } catch (error) {
        console.error('[CRON] Error initializing LeetCode sync:', error);
    }
};

// Initialize on server start
initializeLeetCodeSync();

// Refresh schedule every hour to pick up DB changes without manual restart
cron.schedule('0 * * * *', initializeLeetCodeSync);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
