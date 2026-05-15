import pool from '../config/db.config.js';

const migrate = async () => {
    try {
        console.log('Starting migration for sync_settings table...');
        
        // Add columns if they don't exist
        const columnsToAdd = [
            { name: 'last_run_start', type: 'DATETIME' },
            { name: 'last_run_end', type: 'DATETIME' },
            { name: 'last_run_status', type: 'VARCHAR(20)' },
            { name: 'last_error', type: 'TEXT' },
            { name: 'next_run_at', type: 'DATETIME' }
        ];

        const [existingColumns] = await pool.query('SHOW COLUMNS FROM sync_settings');
        const existingNames = existingColumns.map(c => c.Field);

        for (const col of columnsToAdd) {
            if (!existingNames.includes(col.name)) {
                console.log(`Adding column ${col.name}...`);
                await pool.query(`ALTER TABLE sync_settings ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
