import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import LoginForm from './components/LoginForm.jsx'
import Homepage from './components/Homepage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/home" element={<Homepage />} />
    </Routes>
  </BrowserRouter>
)
