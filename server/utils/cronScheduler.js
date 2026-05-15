import cron from 'node-cron';
import cronParser from 'cron-parser';
import { DateTime } from 'luxon';
import SyncSetting from '../models/syncSetting.model.js';
import { syncAllDetails } from '../controllers/leetcodeDetails.controller.js';

let leetcodeSyncJob = null;

const dayMap = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6
};

/**
 * Calculates the next execution time based on sync_day and sync_time (IST)
 */
export const calculateNextRun = (syncDay, syncTime) => {
    try {
        const dayNum = dayMap[syncDay];
        if (dayNum === undefined) return null;

        const [hour, minute] = syncTime.split(':');
        const cronExpression = `${parseInt(minute)} ${parseInt(hour)} * * ${dayNum}`;
        console.log(`[CRON DEBUG] Calculating next run for: ${cronExpression} (IST)`);
        
        const options = {
            currentDate: DateTime.now().setZone('Asia/Kolkata').toJSDate(),
            tz: 'Asia/Kolkata'
        };

        const parseFunc = cronParser.parseExpression || cronParser.default?.parseExpression;
        if (!parseFunc) {
            throw new Error('cron-parser.parseExpression is not a function');
        }

        const interval = parseFunc(cronExpression, options);
        const nextDate = interval.next().toDate();
        console.log(`[CRON DEBUG] Next run calculated: ${nextDate.toLocaleString()}`);
        return nextDate;
    } catch (error) {
        console.error('[CRON] Error calculating next run:', error);
        return null;
    }
};

/**
 * Initialized the LeetCode automated sync cron job
 */
export const initializeLeetCodeSync = async () => {
    try {
        const settings = await SyncSetting.getByName('leetcode');
        
        console.log('[CRON DEBUG] Current Server Time:', new Date().toString());
        console.log('[CRON DEBUG] Current IST Time:', DateTime.now().setZone('Asia/Kolkata').toString());

        if (!settings) {
            console.log('[CRON] No LeetCode sync settings found in database.');
            return;
        }

        if (!settings.is_active) {
            console.log('[CRON] LeetCode sync is currently disabled in settings.');
            if (leetcodeSyncJob) {
                leetcodeSyncJob.stop();
                leetcodeSyncJob = null;
            }
            return;
        }

        const { sync_day, sync_time } = settings;
        
        // Handle potential HH:mm:ss or HH:mm formats
        const timeParts = sync_time.split(':');
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        
        const dayNum = dayMap[sync_day];
        if (dayNum === undefined) {
            console.error(`[CRON] Invalid sync_day: ${sync_day}`);
            return;
        }

        const cronExpression = `${minute} ${hour} * * ${dayNum}`;
        const nextRun = calculateNextRun(sync_day, sync_time);

        // Update DB with next run time
        await SyncSetting.updateStatus('leetcode', { next_run_at: nextRun });

        // Stop existing job if any
        if (leetcodeSyncJob) {
            leetcodeSyncJob.stop();
        }

        leetcodeSyncJob = cron.schedule(cronExpression, async () => {
            console.log(`[CRON TRIGGERED] Starting sync at ${DateTime.now().setZone('Asia/Kolkata').toString()}`);
            
            const startTime = new Date();
            await SyncSetting.updateStatus('leetcode', { 
                last_run_start: startTime,
                last_run_status: 'RUNNING',
                last_error: null
            });

            try {
                // We call syncAllDetails. Since it's normally an Express handler, 
                // we pass null for res and handle the result via status updates if needed.
                // Note: Modified syncAllDetails should ideally return a promise.
                await syncAllDetails({ query: {} }, null);
                
                const endTime = new Date();
                const updatedNextRun = calculateNextRun(sync_day, sync_time);
                
                await SyncSetting.updateStatus('leetcode', { 
                    last_run_end: endTime,
                    last_run_status: 'SUCCESS',
                    next_run_at: updatedNextRun
                });
                console.log(`[CRON SUCCESS] Completed at ${endTime.toString()}`);
            } catch (error) {
                const endTime = new Date();
                await SyncSetting.updateStatus('leetcode', { 
                    last_run_end: endTime,
                    last_run_status: 'FAILED',
                    last_error: error.message
                });
                console.error(`[CRON ERROR] ${error.message}`);
            }
        }, {
            timezone: "Asia/Kolkata"
        });

        console.log(`[CRON] Scheduled: ${sync_day} at ${sync_time} IST. Next run: ${nextRun?.toLocaleString()}`);

    } catch (error) {
        console.error('[CRON] Initialization failed:', error);
    }
};

// Re-initialize every hour to stay in sync with manual DB changes
cron.schedule('0 * * * *', initializeLeetCodeSync);
