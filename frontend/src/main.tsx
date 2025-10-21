import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/design-system.css'
import './styles/components.css'
import './styles/layouts.css'
import './styles/utilities.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
