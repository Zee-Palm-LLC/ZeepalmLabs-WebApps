import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/alumni-sans/800.css'
import '@fontsource/alumni-sans/900.css'
import '@fontsource/gelasio/400.css'
import '@fontsource/gelasio/400-italic.css'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/500.css'
import '@fontsource/figtree/600.css'
import './styles/base.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
