import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { AuthProvider } from './authContext.jsx'
import ProjectRoutes from './Routes.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ProjectRoutes />
  </AuthProvider>
);