import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa i vendor grandi in chunk propri: cambiano di rado, quindi
        // restano in cache tra i deploy e si scaricano in parallelo invece di
        // gonfiare un unico bundle iniziale. Forma a funzione (non a oggetto)
        // per raggruppare SOLO i moduli già importati per path, senza forzare
        // la risoluzione del barrel `primereact.all` (che tira dentro `quill`).
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('primereact')) return 'primereact'
          if (id.includes('@reduxjs') || id.includes('react-redux')) return 'redux'
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts'
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui'
          if (
            id.includes('/react-router') ||
            id.includes('/react-dom/') ||
            id.includes('/react/')
          )
            return 'react'
        },
      },
    },
  },
})
