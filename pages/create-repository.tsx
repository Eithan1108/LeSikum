'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Input from "@/components/ui/SeconInput"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { fetchUserById, fetchCommunities, addRepository } from '@/lib/db'
import { User, Community } from '@/lib/types'
import { ToastProvider, useToast } from '@/components/ui/Toats'
import RandomLoadingComponent from '@/components/ui/Loading'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  label?: string
}

function Switch({ checked, onChange, id, label }: SwitchProps) {
  return (
    <label 
      htmlFor={id} 
      className="flex items-center cursor-pointer"
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`block w-14 h-8 rounded-full transition-colors ${
            checked ? 'bg-orange-500' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        ></div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-orange-800">
          {label}
        </span>
      )}
    </label>
  )
}

async function fetchUserCommunities(userId: String) {
  const response = await fetch(`/api/communities/getUserCommunities?userId=${userId}`);
  const data = await response.json();

  if (response.ok && data.success) {
      return data.communities; // Returns an array of communities
  } else {
      throw new Error(data.message || "Failed to fetch user communities.");
  }
}

function CreateRepositoryContent() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [communities, setCommunities] = useState<Community[]>([])
  const [name, setName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [description, setDescription] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get('userId')
      if (!userId) return
      try {
        // const [userData, communitiesData] = await Promise.all([
        //   fetchUserById(userId),
        //   fetchCommunities()
        // ])
        // setUser(userData)
        // setCommunities(communitiesData.filter(community => community.admins.includes(userId)))
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

    const communities = await fetchUserCommunities(userId);
    setCommunities(communities);

    
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        addToast("An error occurred while fetching data", "error")
        setIsLoading(false)
      }
    }
    fetchData()
  }, [addToast])

  // services/repositoryService.ts

async function addRepository1(data: any, communityId?: string) {
  try {
      const response = await fetch("/api/repositories/createRepository", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, communityId }),
      });

      if (!response.ok) {
          throw new Error("Failed to create repository");
      }

      const result = await response.json();
      return result.repository;
  } catch (error) {
      console.error("Error in addRepository:", error);
      throw error;
  }
}


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const newRepo = await addRepository1({
        name,
        description,
        author: user.name,
        owner: user.id,
        isPrivate,
        stars: 0,
        tags: [],
        rootFolder: {
          id: 'root',
          name: 'Root',
          items: [],
          path: []
        },
        views: 0,
        likes: 0,
      }, selectedCommunity || undefined)
      addToast("Repository created successfully!", "success")
      router.push(`/repository/${newRepo.id}?userId=${user.id}`)
    } catch (err) {
      console.error("Error creating repository:", err)
      addToast("An error occurred while creating the repository", "error")
    }
  }

  const getVisibilityWarning = () => {
    const selectedCommunityData = communities.find(c => c.id === selectedCommunity)
    if (isPrivate) {
      if (selectedCommunityData) {
        return "This repository will only be visible to community members and those you explicitly share it with."
      } else {
        return "This repository will only be visible to you and those you explicitly share it with."
      }
    } else {
      if (selectedCommunityData?.joinPolicy === "request") {
        return "This repository will be public within the community, but the community requires approval to join."
      } else if (selectedCommunityData?.joinPolicy === "open") {
        return "This repository will be visible to all community members and discoverable by anyone."
      } else {
        return "This repository will be visible and discoverable by anyone."
      }
    }
  }

  if (isLoading) return <RandomLoadingComponent />
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
  if (!user) return <div className="container mx-auto p-4 text-orange-600">User not found</div>

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={() => {}} userId={user.id} />

      <main className="container mx-auto p-4 max-w-3xl">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="max-w-2xl mx-auto bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-orange-200">
            <CardTitle className="text-2xl font-bold text-orange-800">Create New Repository</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-orange-800">Repository Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                  placeholder="Enter repository name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-orange-800">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                  placeholder="Describe your repository"
                />
              </div>
              <div className="flex items-center justify-between space-x-2 bg-orange-100 p-4 rounded-md">
                <span className="text-sm font-medium text-orange-800">Repository Privacy</span>
                <Switch
                  checked={isPrivate}
                  onChange={setIsPrivate}
                  id="privacy-toggle"
                  label={isPrivate ? 'Private' : 'Public'}
                />
              </div>
              {communities.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="community" className="text-sm font-medium text-orange-800">Assign to Community (Optional)</Label>
                  <select
                    id="community"
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                  >
                    <option value="">None</option>
                    {communities.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.name} ({community.joinPolicy === "open" ? 'Open' : 'Request to Join'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-orange-700">
                    {getVisibilityWarning()}
                  </p>
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200 py-2 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Create Repository
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default function CreateRepositoryPage() {
  return (
    <ToastProvider>
      <CreateRepositoryContent />
    </ToastProvider>
  )
}