const sql = require('mssql');

// Database configuration
const config = {
    server: 'localhost',
    port: 1433,
    user: 'sa',
    password: 'ptrj@123',
    database: 'extend_db_ptrj',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

async function checkDatabase() {
    try {
        console.log('Connecting to SQL Server...');
        await sql.connect(config);
        console.log('✅ Connected to SQL Server successfully');

        // Check if user_ptrj table exists
        const tableCheckResult = await sql.query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            AND TABLE_NAME = 'user_ptrj'
        `);

        if (tableCheckResult.recordset.length === 0) {
            console.log('⚠️ Table user_ptrj does not exist. Creating it...');

            // Create the table
            await sql.query(`
                CREATE TABLE user_ptrj (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    email NVARCHAR(255) NOT NULL UNIQUE,
                    password NVARCHAR(255) NOT NULL,
                    role NVARCHAR(50) NOT NULL DEFAULT 'user',
                    createdAt DATETIME2 DEFAULT GETDATE(),
                    updatedAt DATETIME2 NULL
                )
            `);

            console.log('✅ Table user_ptrj created successfully');

            // Insert a default admin user (password: admin123)
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await sql.query(`
                INSERT INTO user_ptrj (name, email, password, role)
                VALUES ('Admin', 'admin@ptrj.com', @password, 'admin')
            `, {
                password: hashedPassword
            });

            console.log('✅ Default admin user created:');
            console.log('   Email: admin@ptrj.com');
            console.log('   Password: admin123');
        } else {
            console.log('✅ Table user_ptrj exists');

            // Check if there are any users
            const userCountResult = await sql.query('SELECT COUNT(*) as count FROM user_ptrj');
            const userCount = userCountResult.recordset[0].count;

            console.log(`📊 Found ${userCount} user(s) in the database`);

            if (userCount === 0) {
                console.log('⚠️ No users found. Creating a default admin user...');

                const bcrypt = require('bcryptjs');
                const hashedPassword = await bcrypt.hash('admin123', 10);

                await sql.query(`
                    INSERT INTO user_ptrj (name, email, password, role)
                    VALUES ('Admin', 'admin@ptrj.com', @password, 'admin')
                `, {
                    password: hashedPassword
                });

                console.log('✅ Default admin user created:');
                console.log('   Email: admin@ptrj.com');
                console.log('   Password: admin123');
            } else {
                // List existing users
                const usersResult = await sql.query(`
                    SELECT id, name, email, role, createdAt
                    FROM user_ptrj
                    ORDER BY createdAt DESC
                `);

                console.log('\n📋 Existing users:');
                usersResult.recordset.forEach(user => {
                    console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Database error:', error);

        if (error.number === 18456) {
            console.log('\n💡 SQL Server login failed. Please check:');
            console.log('   1. SQL Server is running on localhost:1433');
            console.log('   2. Mixed authentication is enabled');
            console.log('   3. User "sa" exists with password "ptrj@123"');
        } else if (error.number === 4060) {
            console.log('\n💡 Database not found. Please create database "extend_db_ptrj"');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Cannot connect to SQL Server. Please check:');
            console.log('   1. SQL Server is running');
            console.log('   2. TCP/IP is enabled for SQL Server');
            console.log('   3. Port 1433 is open');
        }
    } finally {
        await sql.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

checkDatabase();