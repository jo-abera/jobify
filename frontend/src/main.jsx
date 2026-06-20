
/**
 * React bootstrap — theme flash prevention, then App shell.
 * Google OAuth uses Passport redirect (no @react-oauth/google provider needed).
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
