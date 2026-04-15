import Report from '../models/report.model.js';

async function verify() {
    try {
        console.log('Fetching overall stats...');
        const stats = await Report.getOverallStats();
        console.log('Stats:', JSON.stringify(stats, null, 2));

        console.log('\nFetching placed students...');
        const placed = await Report.getPlacedStudents();
        console.log('Placed students count:', placed.length);

        console.log('\nFetching willing students...');
        const willing = await Report.getWillingStudents();
        console.log('Willing students count:', willing.length);
        if (willing.length > 0) {
            console.log('Sample willing student:', JSON.stringify(willing[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
}

verify();
