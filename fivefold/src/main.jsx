import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/outfit'
import '@fontsource-variable/jetbrains-mono'
import 'lenis/dist/lenis.css'
import './styles/base.css'
import './styles/chrome.css'
import './styles/hero.css'
import './styles/process.css'
import './styles/stages.css'
import './styles/sections.css'
import './styles/mobile.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
