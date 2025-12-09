const sql = require('mssql');
const bcrypt = require('bcryptjs');

const config = {
    server: '10.0.0.110',
    port: 1433,
    user: 'sa',
    password: 'ptrj@123',
    database: 'extend_db_ptrj',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

async function createNewAdmin() {
    try {
        await sql.connect(config);
        console.log('✅ Connected to database');

        // Cek apakah user sudah ada
        const checkRequest = new sql.Request();
        checkRequest.input('email', sql.VarChar, 'superadmin@example.com');
        const checkResult = await checkRequest.query(`
            SELECT COUNT(*) as count FROM user_ptrj WHERE email = @email
        `);

        if (checkResult.recordset[0].count > 0) {
            console.log('❌ User superadmin@example.com already exists');
            return;
        }

        // Hash password
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user baru
        const insertRequest = new sql.Request();
        insertRequest.input('name', sql.VarChar, 'Super Admin');
        insertRequest.input('email', sql.VarChar, 'superadmin@example.com');
        insertRequest.input('password', sql.VarChar, hashedPassword);
        insertRequest.input('role', sql.VarChar, 'ADMIN');
        insertRequest.input('divisi', sql.VarChar, 'IT');

        await insertRequest.query(`
            INSERT INTO user_ptrj (name, email, password, role, divisi, createdAt)
            VALUES (@name, @email, @password, @role, @divisi, GETDATE())
        `);

        console.log('✅ New admin user created successfully!');
        console.log('Email: superadmin@example.com');
        console.log('Password:', password);
        console.log('Role: ADMIN');
        console.log('\nSilakan login dengan kredensial baru ini.');

        // Tampilkan semua user admin
        const adminRequest = new sql.Request();
        const adminResult = await adminRequest.query(`
            SELECT id, name, email, role, divisi, createdAt FROM user_ptrj WHERE role = 'ADMIN'
        `);

        console.log('\nAll admin users:');
        console.table(adminResult.recordset);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sql.close();
    }
}

createNewAdmin();