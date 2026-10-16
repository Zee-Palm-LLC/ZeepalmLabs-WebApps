import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/bowlby-one/400.css'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import '@fontsource-variable/inter'
import './styles.css'
import './sections/extra.css'
import App from './App.jsx'

Promise.all([document.fonts.load('400 64px "Bowlby One"'), document.fonts.load('500 30px "DM Mono"')]).finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
