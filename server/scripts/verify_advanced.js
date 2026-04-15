import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function verifyAdvanced() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            userId: 'testadmin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('Testing Sync All (Background)...');
        const syncAllRes = await axios.post(`${API_BASE_URL}/leetcode-details/sync-all`, {}, config);
        console.log('Sync All Response (should be immediate):', syncAllRes.data);

        console.log('Checking Sync Status...');
        const statusRes = await axios.get(`${API_BASE_URL}/leetcode-details/sync-status`, config);
        console.log('Current Sync Status:', statusRes.data);

        console.log('Testing Eligibility Filter (minSolved=1)...');
        const eligibilityRes = await axios.get(`${API_BASE_URL}/leetcode-details/eligible?minSolved=1`, config);
        console.log(`Eligible Students count: ${eligibilityRes.data.total}`);
        if (eligibilityRes.data.total > 0) {
            console.log('Sample Eligible Student:', eligibilityRes.data.data[0].name);
        }

        console.log('Verification of Advanced Features SUCCESS.');

    } catch (error) {
        console.error('Advanced Verification Error:', error.response?.data || error.message);
    }
}

verifyAdvanced();
