import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/upah/',   // <-- TAMBAHKAN INI
    plugins: [react()],
    server: {
        port: 5175
    }
    // ... konfigurasi lainnya yang sudah ada
})