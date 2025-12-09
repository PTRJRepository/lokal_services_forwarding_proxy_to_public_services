const { db } = require('./Dashboard_Utama/utils/db');
const { userRepository } = require('./Dashboard_Utama/utils/user-repository');

async function debugAdminUser() {
    console.log('=== DEBUG ADMIN USER ACCESS ===\n');

    try {
        // 1. Cek koneksi database
        console.log('1. Testing database connection...');
        const testQuery = await db.query('SELECT GETDATE() as current_time');
        console.log('✓ Database connected:', testQuery[0]?.current_time);

        // 2. Lihat semua user di database
        console.log('\n2. All users in database:');
        const allUsers = await userRepository.findAll();
        console.table(allUsers);

        // 3. Cari user dengan role ADMIN
        console.log('\n3. Users with ADMIN role:');
        const adminUsers = allUsers.filter(u => u.role === 'ADMIN');
        if (adminUsers.length === 0) {
            console.log('❌ No users found with role = "ADMIN"');
            console.log('\nChecking for other role variations...');
            const adminLikeUsers = allUsers.filter(u =>
                u.role.toLowerCase().includes('admin')
            );
            if (adminLikeUsers.length > 0) {
                console.log('Found users with "admin" in role (case insensitive):');
                console.table(adminLikeUsers);
            }
        } else {
            console.log('✓ Found admin users:');
            console.table(adminUsers);
        }

        // 4. Cek data user lengkap (termasuk password hash)
        console.log('\n4. Complete user data (with password hashes):');
        const completeUsers = await db.query('SELECT id, name, email, role, divisi, createdAt, updatedAt FROM user_ptrj');
        console.table(completeUsers);

        // 5. Query spesifik untuk mencari admin
        console.log('\n5. Direct SQL query for ADMIN users:');
        const adminQuery = await db.query("SELECT * FROM user_ptrj WHERE role = 'ADMIN'");
        if (adminQuery.length === 0) {
            console.log('❌ No users found with exact role "ADMIN"');

            // Cek variasi lain
            const variations = ['admin', 'Administrator', 'ADMINISTRATOR'];
            for (const variation of variations) {
                const result = await db.query(`SELECT * FROM user_ptrj WHERE role = '${variation}'`);
                if (result.length > 0) {
                    console.log(`Found ${result.length} user(s) with role = "${variation}":`);
                    console.table(result);
                }
            }
        } else {
            console.log('✓ Found ADMIN users:');
            console.table(adminQuery);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Error details:', error.message);
        if (error.originalError) {
            console.error('Original error:', error.originalError);
        }
    }
}

// Jalankan debug
debugAdminUser().then(() => {
    console.log('\n=== DEBUG COMPLETE ===');
    process.exit(0);
}).catch(err => {
    console.error('Debug failed:', err);
    process.exit(1);
});