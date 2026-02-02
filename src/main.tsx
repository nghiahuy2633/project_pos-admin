import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from '@/lib/i18n'

document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
        <Toaster richColors theme="dark" position="top-right" />
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
