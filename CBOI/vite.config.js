import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Trigger reload after react-icons installation
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: 3000,
    proxy: {
      '/apiProxy': {
        target: 'https://services-cboi-uat.isupay.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apiProxy/, '')
      },
      '/txnInfraProxy': {
        target: 'https://api-preprod.txninfra.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/txnInfraProxy/, '')
      }
    }
  }
})
