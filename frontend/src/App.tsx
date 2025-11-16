import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Login from './components/Login';
import SignUp from './components/SignUp';
import Todos from './components/Todos';
import { useAuthStore } from './store/authStore';
import ForgotPassword from './components/ForgotPassword';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />
}

function App() {
  return (
    <div className='bg-slate-100 -z-10'>

      <div className='bg-green-300 h-screen w-screen' style={{ clipPath: 'polygon(0 0, 100% 0, 20% 100%, 0% 100%)' }}>
      </div>
        <BrowserRouter >
        <div className='absolute top-0'>
          <Routes>
            <Route path="/signin" element={<Login/>} />
            <Route path="/signup" element={<SignUp/>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/todos" element={<Todos />} />
            </Route>
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
        </BrowserRouter>

    </div>
  )
}

export default App
