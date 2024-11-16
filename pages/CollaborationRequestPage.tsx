




// Maybe can be removed




'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, X } from "lucide-react"
import Header from '@/components/Theme/Header'
import Footer from "@/components/Theme/Footer"
import { fetchCollaborationRequest, acceptCollaboration, rejectCollaboration } from '@/lib/db'
import { Repository, User } from '../lib/types'
import RandomLoadingComponent from '@/components/ui/Loading'
import { ToastProvider, useToast } from '@/components/ui/Toats'

function CollaborationRequestContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [repo, setRepo] = useState<Repository | null>(null)
  const [inviter, setInviter] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const repoId = params?.repoId as string
      const userId = searchParams?.get('userId')
      if (!repoId || !userId) {
        setError('Invalid URL parameters')
        setLoading(false)
        return
      }

      try {
        const { repository, inviter } = await fetchCollaborationRequest(repoId, userId)
        setRepo(repository)
        setInviter(inviter)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params, searchParams])

  const handleAccept = async () => {
    if (!repo || !inviter) return
    try {
      await acceptCollaboration(repo.id, inviter.id)
      addToast('Collaboration accepted successfully!', 'success')
      // Redirect to repository page or dashboard
    } catch (err) {
      console.error("Error accepting collaboration:", err)
      addToast('Failed to accept collaboration. Please try again.', 'error')
    }
  }

  const handleReject = async () => {
    if (!repo || !inviter) return
    try {
      await rejectCollaboration(repo.id, inviter.id)
      addToast('Collaboration rejected successfully!', 'success')
      // Redirect to dashboard
    } catch (err) {
      console.error("Error rejecting collaboration:", err)
      addToast('Failed to reject collaboration. Please try again.', 'error')
    }
  }

  if (loading) {
    return <RandomLoadingComponent />
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 bg-orange-50">
        <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <p className="text-red-500">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!repo || !inviter) {
    return (
      <div className="container mx-auto p-4 bg-orange-50">
        <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <p className="text-orange-600">Collaboration request not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      <Header onSearch={() => {}} userId={searchParams?.get('userId') || ''} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Link
          href={`/dashboard?userId=${searchParams?.get('userId')}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-orange-200">
            <CardTitle className="text-2xl font-bold text-orange-800">Collaboration Request</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="mb-6 text-orange-700">
              {inviter.name} has invited you to collaborate on the repository "{repo.name}".
            </p>
            <div className="flex space-x-4">
              <Button 
                onClick={handleAccept} 
                className="bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button 
                onClick={handleReject} 
                className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default function CollaborationRequestPage() {
  return (
    <ToastProvider>
      <CollaborationRequestContent />
    </ToastProvider>
  )
}