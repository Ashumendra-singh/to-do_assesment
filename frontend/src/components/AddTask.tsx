import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  status: z.enum(['pending', 'completed']).default('pending'),
})

export type AddTaskFormValues = z.infer<typeof taskSchema>

type AddTaskProps = {
  defaultValues?: Partial<AddTaskFormValues>
  onSubmit?: (values: AddTaskFormValues) => void | Promise<void>
  submitTask?: (values: AddTaskFormValues) => Promise<void>
  includeStatus?: boolean
  submitLabel?: string
}

function AddTask({ defaultValues, onSubmit, submitTask, includeStatus = false, submitLabel }: AddTaskProps) {
  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      ...defaultValues,
    },
  })
  const [apiError, setApiError] = useState<string | null>(null)

  const defaultSubmitTask = async (values: AddTaskFormValues) => {
    const payload = {
      title: values.title,
      description: values.description,
      status: values.status,
      completed: values.status === 'completed',
    }
    const response = await fetch('http://localhost:3000/api/v1/tasks/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw new Error(errorBody?.message ?? 'Failed to save task')
    }
  }

  const handleSubmit = form.handleSubmit(async values => {
    setApiError(null)
    try {
      const submitFn = submitTask ?? defaultSubmitTask
      await submitFn(values)
      await onSubmit?.(values)
      form.reset({ title: '', description: '', status: 'pending' })
    } catch (error) {
      setApiError((error as Error).message)
    }
  })

  const buttonText = submitLabel ?? (submitTask ? 'Update Task' : 'Add Task')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-lg font-semibold">Title</label>
        <input id="title" type="text" {...form.register('title')} className="w-full border px-3 py-2 rounded" />
        {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-lg font-semibold">Description</label>
        <textarea id="description" rows={4} {...form.register('description')} className="w-full border px-3 py-2 rounded" />
        {form.formState.errors.description && <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>}
      </div>
      {includeStatus && (
        <div>
          <label htmlFor="status" className="block text-lg font-semibold">Status</label>
          <select id="status" {...form.register('status')} className="w-full border px-3 py-2 rounded">
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          {form.formState.errors.status && <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>}
        </div>
      )}
      {apiError && <p className="text-sm text-red-500">{apiError}</p>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-5 py-3 rounded text-lg font-semibold"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? `${buttonText.replace(' Task', '')}…` : buttonText}
      </button>
    </form>
  )
}

export default AddTask
