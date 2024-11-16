"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  delay?: number
}

const TooltipContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => {},
})

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  )
}

export function Tooltip({ children, content, delay = 0 }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </TooltipProvider>
  )
}

export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  const { setOpen } = React.useContext(TooltipContext)
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="inline-block"
    >
      {children}
    </div>
  )
}

export function TooltipContent({ children }: { children: React.ReactNode }) {
  const { open } = React.useContext(TooltipContext)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 px-2 py-1 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm dark:bg-gray-700"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}