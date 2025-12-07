import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

// Load RSA keys
const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem'
const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem'

let privateKey: string
let publicKey: string

try {
    privateKey = fs.readFileSync(path.resolve(process.cwd(), privateKeyPath), 'utf8')
    publicKey = fs.readFileSync(path.resolve(process.cwd(), publicKeyPath), 'utf8')
} catch (error) {
    console.error('Failed to load RSA keys:', error)
    // Fallback - will fail if keys don't exist
    privateKey = ''
    publicKey = ''
}

export interface JwtPayload {
    userId: number
    email: string
    name: string
    role: string
    iat?: number
    exp?: number
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    if (!privateKey) {
        throw new Error('Private key not loaded')
    }

    return jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '8h', // Token expires in 8 hours
    })
}

export function verifyToken(token: string): JwtPayload | null {
    if (!publicKey) {
        throw new Error('Public key not loaded')
    }

    try {
        const decoded = jwt.verify(token, publicKey, {
            algorithms: ['RS256']
        }) as JwtPayload
        return decoded
    } catch (error) {
        console.error('Token verification failed:', error)
        return null
    }
}

export function getPublicKey(): string {
    return publicKey
}

export default { signToken, verifyToken, getPublicKey }
