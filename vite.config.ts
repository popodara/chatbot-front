// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'projetA',          
      filename: 'remoteEntry.js', 
      exposes: {
        './Onglets': './src/components/Tabs/PilierOrganisationnel', 
      },
    }),
  ],
  build: {
    target: 'esnext',
  },
})
