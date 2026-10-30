import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted fonts, only the weights we use and only the Latin subsets (see
// docs/DESIGN.md section 3). The plain `/400.css` files pull every subset,
// including Devanagari — 1.7 MB of files this site can never render.
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'

import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
