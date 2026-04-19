import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default',
      },
      include: '**/*.svg',
    })
  ],
  resolve: {
    alias: {
      // react-native on web
      'react-native': 'react-native-web',
      // react-native-safe-area-context - no-op trên web
      'react-native-safe-area-context': path.resolve(__dirname, '../..', 'packages/app/provider/safe-area/index.tsx'),
      // giữ alias @tokki/app cho packages/app
      '@tokki/app': path.resolve(__dirname, '../..', 'packages/app'),
      // subpath cho shared components
      '@tokki/app/components': path.resolve(__dirname, '../..', 'packages/components'),
      // Alias cho components (để resolve components/navbar, components/MessageModal, etc.)
      'components': path.resolve(__dirname, '../..', 'packages/components'),
      // Alias cho assets
      'assets': path.resolve(__dirname, '../..', 'packages/assets'),
      // Solito navigation wrapper cho web
      'solito/navigation': path.resolve(__dirname, '../..', 'packages/app/provider/navigation/solito-web.tsx'),
    },
    dedupe: ['react', 'react-dom'],
    extensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    include: [
      'react', 
      'react-dom', 
      '@tanstack/react-query', 
      'react-native-web' 
    ],
    exclude: [
      'react-native',
      'react-native-safe-area-context',
    ],
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
  },
})