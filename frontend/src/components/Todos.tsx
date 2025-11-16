import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import Navbar from './Navbar'
import AddTask from './AddTask'
import type { AddTaskFormValues } from './AddTask'

type Todo = {
  id: string
  title: string
  description?: string
  completed: boolean
}

type TodosResponse = Todo[] | { tasks: Todo[] }

const fetchTodos = async (token?: string): Promise<TodosResponse> => {
  const response = await fetch('http://localhost:3000/api/v1/tasks/todos', {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.message ?? 'Failed to load todos')
  }
  return response.json()
}

const deleteTodo = async ({ id, token }: { id: string; token?: string }) => {
  const response = await fetch(`http://localhost:3000/api/v1/tasks/todos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.message ?? 'Failed to delete task')
  }
}

const updateTodo = async ({
  id,
  values,
  token,
}: {
  id: string
  values: AddTaskFormValues
  token?: string
}) => {
  const payload = {
    title: values.title,
    description: values.description,
    status: values.status,
    completed: values.status === 'completed',
  }
  const response = await fetch(`http://localhost:3000/api/v1/tasks/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.message ?? 'Failed to update task')
  }
}

function Todos() {
  const token = useAuthStore(state => state.token)
  const queryClient = useQueryClient()
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['todos', token],
    queryFn: () => fetchTodos(token),
  })
  const tasks = Array.isArray(data) ? data : data?.tasks ?? []

  const deleteMutation = useMutation({
    mutationFn: (todoId: string) => deleteTodo({ id: todoId, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', token] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: AddTaskFormValues }) =>
      updateTodo({ id, values, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', token] })
      setEditingTodo(null)
    },
  })

  const handleEdit = useCallback((todo: Todo) => setEditingTodo(todo), [])
  const handleCloseEdit = () => setEditingTodo(null)

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col justify-around items-center">
        <Navbar />
        <section className="space-y-4 bg-white p-8 rounded shadow">
          <p className="text-center py-6">Loading todos…</p>
        </section>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="w-screen h-screen flex flex-col justify-around items-center">
        <Navbar />
        <section className="space-y-4 bg-white p-8 rounded shadow">
          <p className="text-center text-red-500 py-6">{(error as Error).message}</p>
        </section>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-around items-center">
      <Navbar />
      <section className="space-y-4 bg-white p-8 rounded shadow">
        {deleteMutation.isError && (
          <p className="text-sm text-red-500">{(deleteMutation.error as Error).message}</p>
        )}
        {tasks.length === 0 ? (
          <p className="text-center py-6">No tasks yet.</p>
        ) : (
          tasks.map(todo => (
            <article key={todo.id} className="border rounded p-4 space-y-2 min-w-lg">
              <header className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{todo.title}</h2>
                <div className="flex items-center gap-8">
                  <span
                    className={`text-lg font-medium px-2 py-1 rounded ${
                      todo.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {todo.completed ? 'Completed' : 'Pending'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(todo)}
                    className="text-lg bg-blue-600 text-white px-3 py-1 rounded cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(todo._id)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === todo._id}
                    className="text-lg bg-red-600 text-white px-3 py-1 rounded disabled:opacity-60 cursor-pointer"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === todo._id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </header>
              {todo.description && <p className="text-lg text-gray-700">{todo.description}</p>}
            </article>
          ))
        )}
      </section>
      {editingTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit Task</h2>
              <button type="button" onClick={handleCloseEdit} className="text-lg font-semibold px-2">
                ✕
              </button>
            </div>
            <AddTask
              includeStatus
              defaultValues={{
                title: editingTodo.title,
                description: editingTodo.description ?? '',
                status: editingTodo.completed ? 'completed' : 'pending',
              }}
              submitTask={values => updateMutation.mutateAsync({ id: editingTodo._id, values })}
              submitLabel="Update Task"
            />
            {updateMutation.isError && (
              <p className="text-sm text-red-500">{(updateMutation.error as Error).message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Todos
