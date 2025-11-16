import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import Navbar from './Navbar'

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

const signUpApi = async (values: SignUpFormValues) => {
  console.log('Signing up with values:', values)
  const response = await fetch('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(values),
  })
  console.log('Response status:', response)
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.message ?? 'Signup failed')
  }
  const data = await response.json()
  console.log('Response data:', data)
  return data
}

function SignUp() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: '', email: '', password: '' },
  })

  const signUpMutation = useMutation({ mutationFn: signUpApi })

  const onSubmit = handleSubmit(values => signUpMutation.mutate(values))

  return (
    <div className='w-screen h-screen flex flex-col justify-around items-center'>
      <Navbar />
      <div className="w-md mx-auto py-12 bg-white z-10 p-8 rounded shadow">
        <form onSubmit={onSubmit} className="space-y-12">
          <div>
            <label htmlFor="username" className="block text-xl font-medium">Username</label>
            <input id="username" type="text" {...register('username')} className="w-full border px-3 py-2 rounded text-2xl" />
            {errors.username && <p className="text-md text-red-500">{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-xl font-medium">Email</label>
            <input id="email" type="email" {...register('email')} className="w-full border px-3 py-2 rounded text-2xl" />
            {errors.email && <p className="text-md text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-xl font-medium">Password</label>
            <input id="password" type="password" {...register('password')} className="w-full border px-3 py-2 rounded text-2xl" />
            {errors.password && <p className="text-md text-red-500">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={signUpMutation.isPending} className="w-1/2 bg-blue-600 text-white py-2 rounded">
            {signUpMutation.isPending ? 'Creating account…' : 'Sign up'}
          </button>
          {signUpMutation.isError && (
            <p className="text-md text-red-500">
              {(signUpMutation.error as Error)?.message ?? 'Signup failed. Try again.'}
            </p>
          )}
          {signUpMutation.isSuccess && (
            <p className="text-sm text-green-600">
              {signUpMutation.data?.message} {signUpMutation.data?.userName && `(${signUpMutation.data.userName})`}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default SignUp
