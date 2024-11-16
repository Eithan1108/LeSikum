import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'

// Types
type ToastType = 'success' | 'error' | 'info'
type Toast = {
  id: number
  message: string
  type: ToastType
}

// Context
type ToastContextType = {
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType) => {
    setToasts((prevToasts) => [...prevToasts, { id: Date.now(), message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Hook
export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Component
function Toast({ id, message, type, onClose }: Toast & { onClose: () => void }) {
  const [progress, setProgress] = useState(100)
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const duration = 5000 // 5 seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress > 0) {
          return prevProgress - 1
        }
        clearInterval(timer)
        return 0
      })
    }, duration / 100)

    const timeout = setTimeout(() => {
      onClose()
    }, duration)

    return () => {
      clearInterval(timer)
      clearTimeout(timeout)
    }
  }, [onClose])

  return (
    <div className="relative overflow-hidden rounded-md shadow-lg">
      <div className={`${bgColor} text-white px-4 py-2 flex items-center justify-between`}>
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div 
        className="absolute bottom-0 left-0 h-1 bg-white opacity-50 transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default Toast