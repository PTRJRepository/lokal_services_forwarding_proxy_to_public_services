const sql = require('mssql');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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

// Load RSA keys
let privateKey = '';
let publicKey = '';

function loadKeys() {
    const possibleDirs = [
        path.join(process.cwd(), 'keys'),
        path.join(process.cwd(), '..', 'keys'),
    ];

    for (const keysDir of possibleDirs) {
        const privPath = path.join(keysDir, 'private.pem');
        const pubPath = path.join(keysDir, 'public.pem');

        try {
            if (fs.existsSync(privPath) && fs.existsSync(pubPath)) {
                privateKey = fs.readFileSync(privPath, 'utf8');
                publicKey = fs.readFileSync(pubPath, 'utf8');
                console.log('✅ RSA keys loaded from:', keysDir);
                return;
            }
        } catch (error) {
            // Continue
        }
    }
    console.error('⚠️ RSA keys not found');
}

async function debugLogin() {
    console.log('=== DEBUG LOGIN PROCESS ===\n');

    try {
        await sql.connect(config);
        console.log('✅ Connected to database');

        loadKeys();

        if (!privateKey || !publicKey) {
            console.error('❌ Cannot proceed without RSA keys');
            return;
        }

        // 1. Check admin user in database
        console.log('\n1. Checking admin user in database...');
        const adminUser = await sql.query(`
            SELECT * FROM user_ptrj WHERE email = 'admin'
        `);

        if (adminUser.recordset.length === 0) {
            console.error('❌ Admin user not found!');
            return;
        }

        const user = adminUser.recordset[0];
        console.log('✅ Found admin user:');
        console.log('- ID:', user.id);
        console.log('- Email:', user.email);
        console.log('- Role:', user.role);
        console.log('- Name:', user.name);

        // 2. Test password verification
        console.log('\n2. Testing password verification...');
        const testPassword = 'admin'; // Asumsi password default
        const isValidPassword = await bcrypt.compare(testPassword, user.password);
        console.log(isValidPassword ? '✅ Password matches' : '❌ Password does not match');

        // 3. Create JWT token like the login process
        console.log('\n3. Creating JWT token...');
        const payload = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        const token = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '8h',
        });

        console.log('✅ Token created successfully');
        console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

        // 4. Verify the token
        console.log('\n4. Verifying token...');
        try {
            const decoded = jwt.verify(token, publicKey, {
                algorithms: ['RS256']
            });

            console.log('✅ Token verified successfully');
            console.log('Decoded payload:', decoded);

            // Check role
            if (decoded.role === 'ADMIN') {
                console.log('✅ User has ADMIN role - should access admin page');
            } else {
                console.error('❌ User role is not ADMIN:', decoded.role);
            }
        } catch (verifyError) {
            console.error('❌ Token verification failed:', verifyError.message);
        }

        // 5. Check current environment variables
        console.log('\n5. Environment variables:');
        console.log('- MSSQL_HOST:', process.env.MSSQL_HOST);
        console.log('- MSSQL_PORT:', process.env.MSSQL_PORT);
        console.log('- MSSQL_DATABASE:', process.env.MSSQL_DATABASE);

    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Error message:', error.message);
        if (error.originalError) {
            console.error('Original error:', error.originalError);
        }
    } finally {
        await sql.close();
    }
}

debugLogin();