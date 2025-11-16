// import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import Navbar from './Navbar'
import { useNavigate } from 'react-router-dom'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const loginApi = async (values: LoginFormValues) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(values),
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.message ?? 'Login failed')
  }
  const data = await response.json()
  return data
}

function Login() {
  const setAuth = useAuthStore(state => state.setAuth)
  const clearAuth = useAuthStore(state => state.clearAuth)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data, variables) => {
      setAuth({
        userName: data?.username,
        email: variables.email,
        message: data?.message,
        token: data?.token,
      })
      navigate('/todos', { replace: true })
    },
    onError: () => {
      clearAuth()
    },
  })

  const onSubmit = handleSubmit(values => loginMutation.mutate(values))

  return (
    <div className='w-screen h-screen flex flex-col justify-around items-center'>
        <Navbar />
        <div className="w-md mx-auto py-12 bg-white z-10 p-8 rounded shadow">

            <form onSubmit={onSubmit} className="space-y-12">
                <div>
                <label htmlFor="email" className="block text-2xl font-semibold">Email</label>
                <input id="email" type="email" {...register('email')} className="w-full border px-3 py-2 rounded text-2xl" />
                {errors.email && <p className="text-md text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block text-2xl font-semibold">Password</label>
                <input id="password" type="password" {...register('password')} className="w-full border px-3 py-2 rounded text-2xl" />
                {errors.password && <p className="text-md text-red-500">{errors.password.message}</p>}
                </div>
                <button type="submit" disabled={loginMutation.isPending} className="w-1/2 bg-blue-600 flo text-white py-3 rounded text-xl">
                {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
                </button>
                {loginMutation.isError && (
                <p className="text-md text-red-500">
                    {(loginMutation.error as Error)?.message ?? 'Login failed. Try again.'}
                </p>
                )}
                {loginMutation.isSuccess && (
                <p className="text-sm text-green-600">
                    {loginMutation.data?.message} {loginMutation.data?.userName && `(${loginMutation.data.userName})`}
                </p>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-base block float-end text-blue-600 underline font-semibold"
                >
                  Forgot password?
                </button>
            </form>
        </div>
    </div>
  )
}

export default Login
