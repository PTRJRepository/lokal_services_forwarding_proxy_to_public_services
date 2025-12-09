/**
 * Script untuk melihat daftar user Kerani yang sudah dibuat
 */

const sql = require('mssql');
require('dotenv').config({ path: './.env' });

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

async function listKeraniUsers() {
    let pool;

    try {
        pool = await sql.connect(config);

        const result = await pool.request().query(`
            SELECT id, name, email, role, divisi 
            FROM user_ptrj 
            WHERE role = 'KERANI' 
            ORDER BY id
        `);

        console.log('\n========================================');
        console.log('DAFTAR AKUN KERANI:');
        console.log('========================================\n');

        console.log('| No | ID | Divisi      | Username (Email)         | Nama            |');
        console.log('|----|-----|-------------|--------------------------|-----------------|');

        result.recordset.forEach((user, idx) => {
            const no = String(idx + 1).padStart(2, ' ');
            const id = String(user.id).padStart(3, ' ');
            const divisi = (user.divisi || '-').padEnd(11, ' ');
            const email = user.email.padEnd(24, ' ');
            const name = user.name.padEnd(15, ' ');
            console.log(`| ${no} | ${id} | ${divisi} | ${email} | ${name} |`);
        });

        console.log('\n========================================');
        console.log(`Total: ${result.recordset.length} akun Kerani`);
        console.log('========================================\n');

        // Show passwords (these are the plain text passwords we set)
        const divisions = [
            'PG1A', 'PG1B', 'PG2A', 'PG2B', 'DME', 'ARA',
            'ARB1', 'ARB2', 'INFRA', 'AREC', 'IJL', 'STF-OFFICE', 'SECURITY'
        ];

        console.log('\nKREDENSIAL LOGIN (Username = Email):');
        console.log('=====================================');

        for (const divisi of divisions) {
            const username = `kerani_${divisi.toLowerCase().replace('-', '_')}`;
            const password = `Kerani${divisi.replace('-', '')}2024!`;
            // Check if user exists
            const exists = result.recordset.find(u => u.email === username);
            if (exists) {
                console.log(`Divisi ${divisi}:`);
                console.log(`  Username: ${username}`);
                console.log(`  Password: ${password}`);
                console.log('');
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

listKeraniUsers();
