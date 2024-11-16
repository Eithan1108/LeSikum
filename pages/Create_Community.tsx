'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Search, Menu, X, User as UserIcon, Bell, ChevronDown, ArrowLeft } from "lucide-react"
import { addCommunity, fetchUserById } from '@/lib/db'
import { User, Community } from '@/lib/types'
import Header from '@/components/Theme/Header'
import Footer from '@/components/Theme/Footer'
import { ToastProvider, useToast } from '@/components/ui/Toats'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import  Input  from "@/components/ui/SeconInput"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import RandomLoadingComponent from '@/components/ui/Loading'

function CreateCommunityContent() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [joinPolicy, setJoinPolicy] = useState('open')
  const [user, setUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        if (userId) {
          // 
          fetch(`/api/users/findUser?id=${userId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((user) => {
      console.log("Fetched user:", user);
      setUser(user);
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
    });
          
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        addToast('Failed to load data. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  async function addCommunity1(newCommunity: Omit<Community, "id">) {
    const response = await fetch("/api/communities/createCommunity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newCommunity),
    });

    const data = await response.json();
    if (response.ok && data.success) {
        return { id: data.communityId, ...newCommunity };  // Return the new community with its ID
    } else {
        throw new Error(data.message || "Failed to create community.");
    }
}

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!user) {
        throw new Error('User not found');
      }
      const newCommunity: Omit<Community, 'id'> = {
        name,
        description,
        members: [user.id],
        admins: [user.id],
        tags: [],
        rules: [],
        creationDate: new Date().toISOString(),
        lastActivityDate: new Date().toISOString(),
        totalMembers: 1,
        totalContent: 0,
        repositories: [],
        joinPolicy: joinPolicy as 'open' | 'request' | 'invite',
        pendingMembers: []
      }
      const addedCommunity = await addCommunity1(newCommunity)
      addToast('Community created successfully!', 'success');
      router.push(`/community/${addedCommunity.id}?userId=${user.id}`)
    } catch (error) {
      console.error('Error creating community:', error)
      addToast(error instanceof Error ? error.message : 'Failed to create community. Please try again.', 'error');
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSearch(query: string) {
    // Implement search functionality
  }

  if (isLoading) {
    return <RandomLoadingComponent />
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={handleSearch} userId={user?.id} />

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-md">
          <div className="container mx-auto px-4 py-2">
            <a href="#" className="block py-2 text-gray-600 hover:text-orange-600">Home</a>
            <a href="#" className="block py-2 text-gray-600 hover:text-orange-600">Explore</a>
            <a href="#" className="block py-2 text-gray-600 hover:text-orange-600">My Communities</a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto p-4 max-w-3xl">
      <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-orange-200">
            <CardTitle className="text-2xl font-bold text-orange-800">Create a New Community</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-medium text-orange-800">Community Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter community name"
                  className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-lg font-medium text-orange-800">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter community description"
                  className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinPolicy" className="text-lg font-medium text-orange-800">Join Policy</Label>
                <select
                  id="joinPolicy"
                  value={joinPolicy}
                  onChange={(e) => setJoinPolicy(e.target.value)}
                  className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                >
                  <option value="open">Open</option>
                  <option value="request">Request to Join</option>
                  <option value="invite">Invite Only</option>
                </select>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-orange-700">
                    Private communities are only visible to members and require an invitation to join.
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200 py-2 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Community'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}

export default function CreateCommunity() {
  return (
    <ToastProvider>
      <CreateCommunityContent />
    </ToastProvider>
  )
}