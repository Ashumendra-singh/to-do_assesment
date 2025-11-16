import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import AddTask from './AddTask'
import type { AddTaskFormValues } from './AddTask'

function Navbar() {
  const lowerPath = useLocation().pathname.toLowerCase()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const clearAuth = useAuthStore(state => state.clearAuth)
  const navLink = lowerPath.includes('signin')
    ? { to: '/signup', label: 'Sign Up' }
    : lowerPath.includes('signup')
      ? { to: '/signin', label: 'Sign In' }
      : { to: '/signup', label: 'Sign Up' }

  const [showAddTask, setShowAddTask] = useState(false)
  const queryClient = useQueryClient()

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }
  const handleAddTaskSubmit = async (values: AddTaskFormValues) => {
    await queryClient.invalidateQueries({ queryKey: ['todos'] })
    setShowAddTask(false)
  }

  return (
    <>
      <header className='min-w-[80%] mx-auto px-32 py-4 flex justify-around items-center top-0 absolute '>
        <Link to='/' className="text-3xl text-center font-bold border-4 inline-block rounded-2xl px-6 py-3">To-Do App</Link>
        {isAuthenticated ? (
          <div className='space-x-8'>
            <button onClick={handleLogout} className='text-2xl border-2 px-5 py-3 rounded-2xl font-semibold'>
              Logout
            </button>
            <button type="button" onClick={() => setShowAddTask(true)} className='text-2xl px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold'>
              Add Todo
            </button>
          </div>
        ) : (
          <h1 className='text-2xl text-center cursor-pointer border-2 px-5 py-3 rounded-2xl font-semibold'>
            <Link to={navLink.to}>{navLink.label}</Link>
          </h1>
        )}
      </header>
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Add Task</h2>
              <button type="button" onClick={() => setShowAddTask(false)} className="text-lg font-semibold px-2">
                ✕
              </button>
            </div>
            <AddTask onSubmit={handleAddTaskSubmit} />
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
