
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
        console.log("\nAll Users:");
        console.table(resultUsers.recordset);

        // Check specifically for ADMIN users
        const adminUsers = await sql.query(`
            SELECT id, name, email, role, divisi FROM user_ptrj WHERE role = 'ADMIN'
        `);
        console.log("\nADMIN Users:");
        if (adminUsers.recordset.length === 0) {
            console.log("❌ No users with role = 'ADMIN' found!");

            // Check for variations
            const variations = ['admin', 'Administrator', 'ADMINISTRATOR'];
            for (const variation of variations) {
                const result = await sql.query(`
                    SELECT id, name, email, role FROM user_ptrj WHERE role = '${variation}'
                `);
                if (result.recordset.length > 0) {
                    console.log(`\nFound ${result.recordset.length} user(s) with role = '${variation}':`);
                    console.table(result.recordset);
                }
            }

            // Show all unique roles
            const allRoles = await sql.query(`
                SELECT DISTINCT role, COUNT(*) as count FROM user_ptrj GROUP BY role
            `);
            console.log("\nAll roles in database:");
            console.table(allRoles.recordset);
        } else {
            console.table(adminUsers.recordset);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sql.close();
    }
}

checkDb();
