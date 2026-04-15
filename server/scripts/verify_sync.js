import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function verifySync() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            userId: 'testadmin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('Fetching students...');
        const response = await axios.get(`${API_BASE_URL}/leetcode-details`, config);
        const students = response.data.data;
        
        if (students.length === 0) {
            console.log('No students found to sync.');
            return;
        }

        const student = students.find(s => s.leet_code_profile) || students[0];
        console.log(`Testing sync for student: ${student.name} (${student.reg_no})`);
        
        const syncResponse = await axios.post(`${API_BASE_URL}/leetcode-details/sync/${student.id}`, {}, config);
        console.log('Sync Response:', JSON.stringify(syncResponse.data, null, 2));

        console.log('Verifying data update...');
        const verifyResponse = await axios.get(`${API_BASE_URL}/leetcode-details/${student.id}`, config);
        const updated = verifyResponse.data;
        console.log('Updated Record Status:', updated.sync_status);
        console.log('Total Solved:', updated.total_solved);
        console.log('Difficulty Stats:', {
            E: `${updated.easy_solved}/${updated.total_easy}`,
            M: `${updated.medium_solved}/${updated.total_medium}`,
            H: `${updated.hard_solved}/${updated.total_hard}`
        });
        console.log('Last Contest:', {
            name: updated.last_contest_name,
            rank: updated.last_contest_rank,
            date: updated.last_contest_date
        });

        if (updated.sync_status === 'SUCCESS' && updated.total_solved > 0) {
            console.log('Verification SUCCESS: Extended data updated correctly.');
        } else if (updated.sync_status === 'FAILED') {
            console.log('Verification FAILED: Sync failed with message:', updated.error_message);
        } else {
            console.log('Verification INCOMPLETE: Status is', updated.sync_status);
        }

    } catch (error) {
        console.error('Verification Error:', error.response?.data || error.message);
    }
}

verifySync();
