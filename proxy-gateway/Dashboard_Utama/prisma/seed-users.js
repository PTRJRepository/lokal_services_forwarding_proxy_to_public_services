// Seed script to create initial users
// Run with: node prisma/seed-users.js

const bcrypt = require('bcryptjs');
const sql = require('mssql');

const config = {
    server: process.env.MSSQL_HOST || '10.0.0.110',
    port: parseInt(process.env.MSSQL_PORT || '1433'),
    user: process.env.MSSQL_USER || 'sa',
    password: process.env.MSSQL_PASSWORD || 'ptrj@123',
    database: process.env.MSSQL_DATABASE || 'extend_db_ptrj',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

const users = [
    { name: 'Administrator', email: 'admin@rebinmas.com', password: 'admin123', role: 'ADMIN' },
    { name: 'Kerani Divisi 1', email: 'kerani1@rebinmas.com', password: 'kerani123', role: 'KERANI' },
    { name: 'Kerani Divisi 2', email: 'kerani2@rebinmas.com', password: 'kerani123', role: 'KERANI' },
    { name: 'Staff Accounting', email: 'accounting1@rebinmas.com', password: 'accounting123', role: 'ACCOUNTING' },
];

async function seedUsers() {
    let pool = null;

    try {
        console.log('Connecting to SQL Server...');
        console.log('Server:', config.server + ':' + config.port);
        console.log('Database:', config.database);

        pool = await sql.connect(config);
        console.log('Connected!');

        for (const user of users) {
            // Check if user exists
            const existing = await pool.request()
                .input('email', user.email)
                .query('SELECT id FROM user_ptrj WHERE email = @email');

            if (existing.recordset.length > 0) {
                console.log(`User ${user.email} already exists, skipping...`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Insert user
            await pool.request()
                .input('name', user.name)
                .input('email', user.email)
                .input('password', hashedPassword)
                .input('role', user.role)
                .query(`
                    INSERT INTO user_ptrj (name, email, password, role) 
                    VALUES (@name, @email, @password, @role)
                `);

            console.log(`Created user: ${user.email} (${user.role})`);
        }

        console.log('\n✓ Seed completed!');
        console.log('\nLogin credentials:');
        console.log('------------------');
        users.forEach(u => {
            console.log(`${u.role}: ${u.email} / ${u.password}`);
        });

    } catch (error) {
        console.error('Error seeding users:', error.message);
    } finally {
        if (pool) {
            await pool.close();
        }
        process.exit(0);
    }
}

seedUsers();
