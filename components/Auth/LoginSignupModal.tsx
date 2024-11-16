'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Input from "@/components/ui/SeconInput"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, User, Mail, Lock } from 'lucide-react'
import RandomLoadingComponent from "@/components/ui/Loading"

export default function LoginSignupModal({ isOpen, onClose, onLoginSuccess }: { isOpen: boolean; onClose: () => void; onLoginSuccess: (userId: string) => void }) {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!isLogin) {
      try {
        const newUser = {
          email,
          name,
          username,
          password,
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "",
          followers: 0,
          following: 0,
          summariesCount: 0,
          totalLikes: 0,
          totalViews: 0,
          rate: 0,
          status: "new",
          likedSummaries: [],
          savedSummaries: [],
          likedRepositories: [],
          savedRepositories: [],
        }

        const response = await await fetch("/api/users/register", {
            method: "post",
            body: JSON.stringify(newUser),
          });
        if (response.ok) {
          const result = await response.json()
          console.log("User ID:", result.userId)
          onLoginSuccess(result.userId)
        } else {
          throw new Error("Failed to register user")
        }
      } catch (error) {
        console.error("Auth error:", error)
        setError("An error occurred during signup. Please try again.")
      }
    } else {
      try {
        const response = await fetch("/api/users/login", {
            method: "post",
            body: JSON.stringify({ username: username, password: password }),
          });

        const result = await response.json()
        if (result.success) {
          onLoginSuccess(result.userId)
        } else {
          throw new Error(result.message || "Login failed")
        }
      } catch (error) {
        console.error("Auth error:", error)
        setError("Invalid username or password")
      }
    }

    setIsLoading(false)
  }

  if (!isOpen) return null

  if (isLoading) {
    return <RandomLoadingComponent />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Log In' : 'Sign Up'}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Welcome back! Please log in to your account."
              : "Create a new account to start sharing summaries."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                <Input
                  id="username"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="outline"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full"
          >
            {isLogin
              ? "Need an account? Sign Up"
              : "Already have an account? Log In"}
          </Button>
          {isLogin && (
            <Link
              href="/forgot-password"
              className="text-sm text-orange-600 hover:underline"
            >
              Forgot your password?
            </Link>
          )}
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}