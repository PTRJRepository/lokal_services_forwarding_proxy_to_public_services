
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

async function checkDb() {
    try {
        await sql.connect(config);
        console.log("Connected to MSSQL");

        // Check columns
        const resultSchema = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'user_ptrj'
        `);
        console.log("Columns in user_ptrj:", resultSchema.recordset.map(r => r.COLUMN_NAME));

        // Check users
        const resultUsers = await sql.query(`
            SELECT id, name, email, role, divisi FROM user_ptrj
        `);
        console.log("Users:", resultUsers.recordset);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sql.close();
    }
}

checkDb();
