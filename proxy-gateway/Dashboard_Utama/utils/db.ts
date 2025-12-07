import sql from 'mssql'

// SQL Server configuration
const config: sql.config = {
    server: process.env.MSSQL_HOST || '223.25.98.220',
    port: parseInt(process.env.MSSQL_PORT || '3001'),
    user: process.env.MSSQL_USER || 'sa',
    password: process.env.MSSQL_PASSWORD || 'ptrj@123',
    database: process.env.MSSQL_DATABASE || 'extend_db_ptrj',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

// Connection pool singleton
let pool: sql.ConnectionPool | null = null

export async function getConnection(): Promise<sql.ConnectionPool> {
    if (pool) {
        return pool
    }

    try {
        pool = await sql.connect(config)
        console.log('Connected to SQL Server')
        return pool
    } catch (error) {
        console.error('Failed to connect to SQL Server:', error)
        throw error
    }
}

export async function closeConnection(): Promise<void> {
    if (pool) {
        await pool.close()
        pool = null
    }
}

// Helper to execute queries
export async function query<T>(sqlQuery: string, params?: Record<string, any>): Promise<T[]> {
    const conn = await getConnection()
    const request = conn.request()

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value)
        })
    }

    const result = await request.query(sqlQuery)
    return result.recordset as T[]
}

export default { getConnection, closeConnection, query }
