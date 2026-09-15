import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './i18n/LangContext'
import { PublicDataProvider } from './data/PublicDataContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <PublicDataProvider>
      <HashRouter>
        <App />
      </HashRouter>
      </PublicDataProvider>
    </LangProvider>
  </StrictMode>,
)
