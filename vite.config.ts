import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const configuredBasePath = process.env.BASE_PATH
const base = configuredBasePath
  ? `${configuredBasePath.replace(/\/+$/, '')}/`
  : '/'

export default defineConfig({
  base,
  plugins: [react()],
})
