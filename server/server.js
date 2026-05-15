import app from './app.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { syncAllDetails } from './controllers/leetcodeDetails.controller.js';
import SyncSetting from './models/syncSetting.model.js';

import { initializeLeetCodeSync } from './utils/cronScheduler.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize Cron Jobs
initializeLeetCodeSync();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
