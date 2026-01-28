import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://pos-fuyb.onrender.com',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },

  server: {
  port: 5177, // Ép đúng port cụ đang dùng
  proxy: {
    '/api': {
      target: 'https://pos-fuyb.onrender.com',
      changeOrigin: true,
      secure: false,
    },
  },
},


})

