'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Input from "@/components/ui/SeconInput"
import { CommunityCard } from "@/components/Cards/CommunityCard"
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { fetchCommunities, fetchUserById } from '@/lib/db'
import { Community, User } from '@/lib/types'
import { Search, ChevronLeft, ChevronRight, Grid, List, Tag, Filter, ArrowLeft, X, Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import RandomLoadingComponent from '@/components/ui/Loading'

export default function AllCommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'default'>('default')
  const router = useRouter()
  const searchParams = useSearchParams()
  const communitiesPerPage = 12


  // File: utils/community.ts

async function fetchAllCommunities() {
  try {
    const response = await fetch('/api/communities/getAllCommunities', {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch communities:', errorData.message);
      return {
        success: false,
        message: errorData.message,
      };
    }

    const result = await response.json();
    console.log('Communities fetched successfully:', result.data);
    return {
      success: true,
      communities: result.data,
    };
  } catch (error) {
    console.error('Error fetching communities:', error);
    return {
      success: false,
      message: 'An error occurred while fetching communities.',
    };
  }
}



  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const userId = searchParams.get('userId')
        // const [allCommunities, userData] = await Promise.all([
        //   fetchCommunities(),
        //   userId ? fetchUserById(userId) : null
        // ])

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
        

        const result = await fetchAllCommunities();
        setCommunities(result.communities)
        setFilteredCommunities(result.communities)
        
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [searchParams])

  useEffect(() => {
    const filterCommunities = () => {
      let results = communities.filter(community =>
        (community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCategories.length === 0 || selectedCategories.some(category => community.tags.includes(category)))
      )

      switch (sortBy) {
        case 'recent':
          results = results.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
          break
        case 'popular':
          results = results.sort((a, b) => b.totalMembers - a.totalMembers)
          break
        default:
          // Keep the default order
          break
      }

      setFilteredCommunities(results)
      setCurrentPage(1)
    }

    filterCommunities()
  }, [searchTerm, communities, selectedCategories, sortBy])

  const indexOfLastCommunity = currentPage * communitiesPerPage
  const indexOfFirstCommunity = indexOfLastCommunity - communitiesPerPage
  const currentCommunities = filteredCommunities.slice(indexOfFirstCommunity, indexOfLastCommunity)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const navigateToCommunity = (community: Community) => {
    router.push(`/community/${community.id}?userId=${user?.id || ''}`)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
    setSortBy('default')
  }

  const allCategories = Array.from(new Set(communities.flatMap(community => community.tags)))

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={handleSearch} userId={user?.id} />
      <main className="container mx-auto px-4 py-8">
        <Link
          href={`/dashboard?userId=${user?.id || ''}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-800">All Communities</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`border-orange-300 text-orange-600 hover:bg-orange-100 ${viewMode === 'grid' ? 'bg-orange-200' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`border-orange-300 text-orange-600 hover:bg-orange-100 ${viewMode === 'list' ? 'bg-orange-200' : ''}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-orange-300 focus:border-orange-500 focus:ring-orange-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" />
          </div>
          <Select value={sortBy} onValueChange={(value: 'recent' | 'popular' | 'default') => setSortBy(value)}>
            <SelectTrigger className="w-[180px] border-orange-300 text-orange-600">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto border-orange-300 text-orange-600 hover:bg-orange-100">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white bg-opacity-80 backdrop-blur-sm">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-orange-800">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map(category => (
                      <Button
                        key={category}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCategory(category)}
                        className={`border-orange-300 text-orange-600 hover:bg-orange-100 ${selectedCategories.includes(category) ? 'bg-orange-200' : ''}`}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={clearFilters} className="border-orange-300 text-orange-600 hover:bg-orange-100">
            <X className="h-4 w-4 mr-2" /> Clear Filters
          </Button>
        </div>
        {isLoading ? (
          <RandomLoadingComponent />
        ) : (
          <>
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-6'}`}>
              {currentCommunities.map((community) => (
                <CommunityCard
                  community={community}
                  onClick={() => navigateToCommunity(community)}
                />
              ))}
            </div>
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-600 hover:bg-orange-100"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              {Array.from({ length: Math.ceil(filteredCommunities.length / communitiesPerPage) }, (_, i) => (
                <Button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  className={currentPage === i + 1 ? "bg-orange-500 text-white" : "border-orange-300 text-orange-600 hover:bg-orange-100"}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastCommunity >= filteredCommunities.length}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-600 hover:bg-orange-100"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}