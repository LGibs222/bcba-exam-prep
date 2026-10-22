import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import contentHashes from './content-hashes.js'
export default defineConfig({ plugins: [react(), contentHashes()], base: '/bcba-exam-prep/' })
