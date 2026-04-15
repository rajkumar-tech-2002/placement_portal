import app from './app.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { syncAllDetails } from './controllers/leetcodeDetails.controller.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Schedule LeetCode Sync at 2:00 AM every day
cron.schedule('0 2 * * *', () => {
    console.log('[CRON] Starting scheduled LeetCode sync...');
    syncAllDetails(null, null);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
