import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type AuthPayload = {
  username?: string
}

type AuthState = {
  isAuthenticated: boolean
  username?: string
  setAuth: (payload: AuthPayload) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isAuthenticated: false,
      setAuth: payload =>
        set({
          isAuthenticated: true,
          username: payload.username,
          
        }),
      clearAuth: () =>
        set({
          isAuthenticated: false,
          username: undefined,
          
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        username: state.username,
        
      }),
    },
  ),
)
