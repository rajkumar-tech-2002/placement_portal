import pool from './config/db.config.js';
import StudentPlacement from './models/studentPlacement.model.js';

async function test() {
    try {
        console.log('Testing StudentPlacement.getAll sorting...');
        const students = await StudentPlacement.getAll(5, 0);
        console.log('Results (first 5):');
        students.forEach(s => {
            console.log(`- ${s.cambus_details} | ${s.department} | ${s.name}`);
        });
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test();
