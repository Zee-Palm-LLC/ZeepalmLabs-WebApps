import ReactDOM from 'react-dom/client'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/500.css'
import '@fontsource/figtree/600.css'
import '@fontsource/figtree/700.css'
import './styles/base.css'
import './styles/dashboard.css'
import './styles/pages.css'
import './styles/tracker.css'
import gsap from 'gsap'
import App from './App.jsx'

gsap.config({ nullTargetWarn: false })

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
