import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

const requestOtpSchema = z.object({
  email: z.string().email('Enter a valid email.'),
})

const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  otp: z.string().min(4, 'OTP must be at least 4 characters.'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
})

type RequestOtpValues = z.infer<typeof requestOtpSchema>
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

const requestOtpApi = async (values: RequestOtpValues) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(values),
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.message ?? 'Failed to send OTP')
  }
  return response.json()
}

const resetPasswordApi = async (values: ResetPasswordValues) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/reset-password/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(values),
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.message ?? 'Failed to reset password')
  }
  return response.json()
}

function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [emailForReset, setEmailForReset] = useState('')
  const navigate = useNavigate()

  const requestForm = useForm<RequestOtpValues>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: '' },
  })

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '', otp: '', newPassword: '' },
  })

  const requestOtpMutation = useMutation({
    mutationFn: requestOtpApi,
    onSuccess: (data, variables) => {
      setEmailForReset(variables.email)
      resetForm.reset({ email: variables.email, otp: '', newPassword: '' })
      setStep('reset')
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      resetForm.reset({ email: '', otp: '', newPassword: '' })
      requestForm.reset({ email: '' })
      setStep('request')
      navigate('/login', { replace: true })
    },
  })

  const submitRequest = requestForm.handleSubmit(values => requestOtpMutation.mutate(values))
  const submitReset = resetForm.handleSubmit(values => resetPasswordMutation.mutate(values))

  return (
    <div className="w-screen h-screen flex flex-col justify-around items-center">
      <Navbar />
      <div className="w-md mx-auto py-12 bg-white z-10 p-8 rounded shadow space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Forgot Password</h1>
          <p className="text-sm text-gray-600">
            {step === 'request'
              ? 'Enter your email to receive an OTP.'
              : `An OTP was sent to ${emailForReset || resetForm.getValues('email')}.`}
          </p>
        </header>

        {step === 'request' ? (
          <form onSubmit={submitRequest} className="space-y-6">
            <div>
              <label htmlFor="request-email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="request-email"
                type="email"
                {...requestForm.register('email')}
                className="w-full border px-3 py-2 rounded"
              />
              {requestForm.formState.errors.email && (
                <p className="text-sm text-red-500">{requestForm.formState.errors.email.message}</p>
              )}
            </div>
            {requestOtpMutation.isError && (
              <p className="text-sm text-red-500">
                {(requestOtpMutation.error as Error).message}
              </p>
            )}
            {requestOtpMutation.isSuccess && (
              <p className="text-sm text-green-600">
                OTP sent successfully. Check your inbox.
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded"
              disabled={requestOtpMutation.isPending}
            >
              {requestOtpMutation.isPending ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitReset} className="space-y-6">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                {...resetForm.register('email')}
                className="w-full border px-3 py-2 rounded"
              />
              {resetForm.formState.errors.email && (
                <p className="text-sm text-red-500">{resetForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="reset-otp" className="block text-sm font-medium">
                OTP
              </label>
              <input
                id="reset-otp"
                type="text"
                {...resetForm.register('otp')}
                className="w-full border px-3 py-2 rounded"
              />
              {resetForm.formState.errors.otp && (
                <p className="text-sm text-red-500">{resetForm.formState.errors.otp.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium">
                New Password
              </label>
              <input
                id="reset-password"
                type="password"
                {...resetForm.register('newPassword')}
                className="w-full border px-3 py-2 rounded"
              />
              {resetForm.formState.errors.newPassword && (
                <p className="text-sm text-red-500">{resetForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            {resetPasswordMutation.isError && (
              <p className="text-sm text-red-500">
                {(resetPasswordMutation.error as Error).message}
              </p>
            )}
            {resetPasswordMutation.isSuccess && (
              <p className="text-sm text-green-600">
                Password updated successfully. You can sign in with your new password.
              </p>
            )}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? 'Updating…' : 'Reset Password'}
              </button>
              <button
                type="button"
                className="flex-1 border border-gray-300 py-2 rounded"
                onClick={() => setStep('request')}
                disabled={resetPasswordMutation.isPending}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
