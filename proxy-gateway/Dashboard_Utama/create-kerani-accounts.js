/**
 * Script untuk membuat akun Kerani untuk setiap divisi
 * Jalankan dengan: node create-kerani-accounts.js
 */

const sql = require('mssql');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

// Konfigurasi database
const config = {
    user: process.env.MSSQL_USER || 'sa',
    password: process.env.MSSQL_PASSWORD || 'ptrj@123',
    server: process.env.MSSQL_HOST || 'localhost',
    port: parseInt(process.env.MSSQL_PORT) || 1433,
    database: process.env.MSSQL_DATABASE || 'extend_db_ptrj',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

// Daftar divisi dari gambar
const divisions = [
    'PG1A',
    'PG1B',
    'PG2A',
    'PG2B',
    'DME',
    'ARA',
    'ARB1',
    'ARB2',
    'INFRA',
    'AREC',
    'IJL',
    'STF-OFFICE',
    'SECURITY'
];

// Service IDs yang bisa diakses Kerani
const keraniServices = ['upah', 'absen', 'backend-upah'];

// Hasil akun yang dibuat
const createdAccounts = [];

async function createKeraniAccounts() {
    let pool;

    try {
        console.log('Connecting to database...');
        pool = await sql.connect(config);
        console.log('Connected!\n');

        // Buat tabel AccessControl jika belum ada
        console.log('Checking/Creating AccessControl table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AccessControl' AND xtype='U')
            BEGIN
                CREATE TABLE AccessControl (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    userId NVARCHAR(255) NOT NULL,
                    serviceId NVARCHAR(255) NOT NULL,
                    createdAt DATETIME DEFAULT GETDATE(),
                    CONSTRAINT UQ_user_service UNIQUE (userId, serviceId)
                );
            END
        `);
        console.log('AccessControl table ready.\n');

        for (const divisi of divisions) {
            // Generate username dan password
            const username = `kerani_${divisi.toLowerCase().replace('-', '_')}`;
            const password = `Kerani${divisi.replace('-', '')}2024!`;
            const name = `Kerani ${divisi}`;

            console.log(`Creating account for ${divisi}...`);

            // Cek apakah user sudah ada
            const existingUser = await pool.request()
                .input('email', sql.NVarChar, username)
                .query('SELECT id FROM user_ptrj WHERE email = @email');

            if (existingUser.recordset.length > 0) {
                console.log(`  - User ${username} already exists, skipping...`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('email', sql.NVarChar, username)
                .input('password', sql.NVarChar, hashedPassword)
                .input('role', sql.NVarChar, 'KERANI')
                .input('divisi', sql.NVarChar, divisi)
                .query(`
                    INSERT INTO user_ptrj (name, email, password, role, divisi)
                    OUTPUT INSERTED.id
                    VALUES (@name, @email, @password, @role, @divisi)
                `);

            const userId = result.recordset[0].id;
            console.log(`  - User created with ID: ${userId}`);

            // Assign services
            for (const serviceId of keraniServices) {
                await pool.request()
                    .input('userId', sql.NVarChar, String(userId))
                    .input('serviceId', sql.NVarChar, serviceId)
                    .query('INSERT INTO AccessControl (userId, serviceId) VALUES (@userId, @serviceId)');
            }
            console.log(`  - Services assigned: ${keraniServices.join(', ')}`);

            createdAccounts.push({
                divisi,
                username,
                password,
                name
            });
        }

        console.log('\n========================================');
        console.log('DAFTAR AKUN KERANI YANG BERHASIL DIBUAT:');
        console.log('========================================\n');

        console.log('| No | Divisi      | Username                 | Password                  |');
        console.log('|----|-------------|--------------------------|---------------------------|');

        createdAccounts.forEach((acc, idx) => {
            const no = String(idx + 1).padStart(2, ' ');
            const divisi = acc.divisi.padEnd(11, ' ');
            const username = acc.username.padEnd(24, ' ');
            const password = acc.password.padEnd(25, ' ');
            console.log(`| ${no} | ${divisi} | ${username} | ${password} |`);
        });

        console.log('\n========================================');
        console.log(`Total: ${createdAccounts.length} akun berhasil dibuat`);
        console.log('Setiap akun memiliki akses ke: Dashboard Utama, Upah, Absen');
        console.log('========================================\n');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

createKeraniAccounts();
