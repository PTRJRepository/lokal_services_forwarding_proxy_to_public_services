// Seed script to create initial admin user in SQL Server
// Run with: node prisma/seed-admin-mssql.js

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

async function seedAdmin() {
    let pool = null;

    try {
        console.log('Connecting to SQL Server...');
        console.log(`Server: ${config.server}:${config.port}`);
        console.log(`Database: ${config.database}`);

        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server!');

        const email = 'admin';
        const password = 'ptrj@123';
        const name = 'Administrator';
        const role = 'ADMIN';

        // Check if user exists
        const existing = await pool.request()
            .input('email', email)
            .query('SELECT id FROM user_ptrj WHERE email = @email');

        if (existing.recordset.length > 0) {
            console.log('User admin sudah ada!');
            console.log(`Email: ${email}`);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await pool.request()
            .input('name', name)
            .input('email', email)
            .input('password', hashedPassword)
            .input('role', role)
            .query(`
                INSERT INTO user_ptrj (name, email, password, role) 
                VALUES (@name, @email, @password, @role)
            `);

        console.log('\n✅ Admin user created successfully!');
        console.log('----------------------------');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: ${role}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\nPastikan:');
            console.log('1. SQL Server running di ' + config.server + ':' + config.port);
            console.log('2. TCP port forwarder berjalan');
            console.log('3. Database extend_db_ptrj sudah dibuat');
        }
    } finally {
        if (pool) {
            await pool.close();
        }
        process.exit(0);
    }
}

seedAdmin();
