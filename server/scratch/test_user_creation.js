import User from '../models/user.model.js';

const test = async () => {
    try {
        const userData = {
            name: 'Test Super Admin',
            user_id: 'test.super.admin',
            password: 'password123',
            role: 'SUPER ADMIN',
            department: 'CSE',
            campus: 'NEC'
        };

        const result = await User.create(userData);
        console.log('User created successfully:', result);

        // Cleanup
        await User.delete(result.id);
        console.log('Test user deleted.');

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
};

test();
