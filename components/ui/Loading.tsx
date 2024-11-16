'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookOpen, Users, MessageSquare, ThumbsUp, Bell } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RandomLoadingComponent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setMounted(prevMounted => !prevMounted)
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const getRandomColor = () => {
    const colors = ['text-orange-500', 'text-orange-600', 'text-orange-700', 'text-orange-800']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getRandomSize = () => {
    const sizes = ['w-8 h-8', 'w-10 h-10', 'w-12 h-12']
    return sizes[Math.floor(Math.random() * sizes.length)]
  }

  const animations = [
    // Spinning Gradient Border
    <div key="spinning-gradient" className={`${getRandomSize()} rounded-full p-1 bg-gradient-to-r from-orange-400 to-orange-600 animate-spin`}>
      <div className="w-full h-full bg-orange-50 rounded-full"></div>
    </div>,
    
    // Pulsing Notification Icons
    <div key="pulsing-icons" className="flex space-x-4">
      {[Bell, MessageSquare, Users, BookOpen, ThumbsUp].map((Icon, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
        >
          <Icon className={`${getRandomColor()} w-8 h-8`} />
        </motion.div>
      ))}
    </div>,
    
    // Growing Bars
    <div key="growing-bars" className="flex space-x-2">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-3 h-16 ${getRandomColor()} rounded-full`}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{ originY: 1 }}
        />
      ))}
    </div>,
    
    // Rotating Squares
    <div key="rotating-squares" className="relative w-24 h-24">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 ${getRandomColor()} border-2 rounded-lg`}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.25, ease: "linear" }}
          style={{ transformOrigin: 'center' }}
        />
      ))}
    </div>,
    
    // Bouncing SumIt Logo
    <div key="bouncing-logo" className="relative w-24 h-24">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className={`${getRandomSize()} ${getRandomColor()} font-bold text-4xl flex items-center justify-center bg-orange-100 rounded-full`}>
          SI
        </div>
      </motion.div>
    </div>,

    // Flipping Card
    <motion.div
      key="flipping-card"
      className={`${getRandomSize()} bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl`}
      animate={{ rotateY: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      SumIt
    </motion.div>,

    // Circular Progress
    <svg key="circular-progress" className={`${getRandomSize()}`} viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#FED7AA"
        strokeWidth="8"
      />
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#EA580C"
        strokeWidth="8"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
    </svg>,
  ]

  const renderAnimation = () => {
    if (!mounted) {
      // Return a simple, static loading indicator for server-side rendering
      return (
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      )
    }
    const randomIndex = Math.floor(Math.random() * animations.length)
    return animations[randomIndex]
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-orange-50 z-50">
      {renderAnimation()}
      <p className="mt-4 text-orange-600 font-semibold">Loading...</p>
    </div>
  )
}