'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Star,
  TrendingUp,
  Clock,
  Edit,
  Settings,
  Heart,
  Bookmark,
  BookOpen,
  Search,
  Bell,
  User,
  ArrowLeft,
  Users,
  Lock,
  Unlock,
  UserPlus,
  UserCheck,
} from "lucide-react"
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { SummaryCard } from "@/components/Cards/SummaryCard"
import { CommunityCard } from "@/components/Cards/CommunityCard"
import { RepositoryCard } from "@/components/Cards/RepositoryCard"
import  EditProfileModal  from "../components/ui/EditProfile"
import {
  fetchUserById,
  fetchSummariesByOwnerId,
  fetchLikedSummaries,
  fetchSavedSummaries,
  fetchAllUserRepositories,
  fetchLikedRepositories,
  fetchSavedRepositories,
  updateUser,
  fetchCommunityById
} from "@/lib/db"
import RandomLoadingComponent from '@/components/ui/Loading'


async function getCommunityById(communityId) {
  try {
      const response = await fetch(`/api/communities/getCommunityById?id=${communityId}`);
      if (!response.ok) {
          throw new Error("Failed to fetch community");
      }
      const data = await response.json();
      return data.community;
  } catch (error) {
      console.error("Error fetching community:", error);
      throw error;
  }
}

export default function ProfilePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const [user, setUser] = useState(null)
  const [userSummaries, setUserSummaries] = useState([])
  const [likedSummaries, setLikedSummaries] = useState([])
  const [savedSummaries, setSavedSummaries] = useState([])
  const [userRepositories, setUserRepositories] = useState([])
  const [likedRepositories, setLikedRepositories] = useState([])
  const [savedRepositories, setSavedRepositories] = useState([])
  const [userCommunities, setUserCommunities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [showPrivateRepos, setShowPrivateRepos] = useState(false)
  const [showPrivateCommunities, setShowPrivateCommunities] = useState(false)
  const [showPrivateSummaries, setShowPrivateSummaries] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        setIsLoading(true)
        try {
          fetch(`/api/users/findUser?id=${userId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json(); // Make sure to return the JSON
          })
          .then((user) => {
            console.log("Fetched user:", user); // This should now correctly log the user object
            setUser(user); // Assuming setUser is a function to update state
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
          });

          const response = await fetch(`/api/users/getUserSummaries?userId=${userId}`);
          if (!response.ok) {
              throw new Error('Failed to fetch user summaries');
          }
          const data = await response.json();
          setUserSummaries(data.summaries);

          const response1 = await fetch(`/api/users/getUserRepos?userId=${userId}`);
          if (!response1.ok) {
              throw new Error('Failed to fetch user summaries');
          }
          const data1 = await response1.json(); // Use response1 instead of response
          console.log(data1.repositories);
          setUserRepositories(data1.repositories);

          const response2 = await fetch(`/api/users/getUserCommunities?userId=${userId}`);
          if (!response2.ok) {
              throw new Error('Failed to fetch user communities');
          }
          const data2 = await response2.json();
          console.log(data2.communities);
          setUserCommunities(data2.communities);

          const response3 = await fetch(`/api/users/getUserLikedSummaries?userId=${userId}`);
          if (!response3.ok) {
              throw new Error('Failed to fetch liked summaries');
          }
          const data3 = await response3.json();
          console.log("Liked summaries:",data3.likedSummaries);
          setLikedSummaries(data3.likedSummaries);

          const response4 = await fetch(`/api/users/getUserLikedRepositories?userId=${userId}`);
          if (!response4.ok) {
              throw new Error('Failed to fetch liked repositories');
          }
          const data4 = await response4.json();
          console.log(data4.likedRepositories);
          setLikedRepositories(data4.likedRepositories);


          const response5 = await fetch(`/api/users/getUserSavedRepositories?userId=${userId}`);
          if (!response5.ok) {
              throw new Error('Failed to fetch saved repositories');
          }
          const data5 = await response5.json();
          console.log(data5.savedRepositories);
          setSavedRepositories(data5.savedRepositories);
          

          const response6 = await fetch(`/api/users/getUserSavedSummaries?userId=${userId}`);
          if (!response6.ok) {
              throw new Error('Failed to fetch saved summaries');
          }
          const data6 = await response6.json();
          console.log(data6.savedSummaries);
          setSavedSummaries(data6.savedSummaries);

          




          // const [
          //   userData,
          //   summariesData,
          //   likedSummariesData,
          //   savedSummariesData,
          //   allReposData,
          //   likedReposData,
          //   savedReposData
          // ] = await Promise.all([
          //   fetchUserById(userId),
          //   fetchSummariesByOwnerId(userId),
          //   fetchLikedSummaries(userId),
          //   fetchSavedSummaries(userId),
          //   fetchAllUserRepositories(userId),
          //   fetchLikedRepositories(userId),
          //   fetchSavedRepositories(userId)
          // ])
          // setUser(userData)
          // setUserSummaries(summariesData)
          // setLikedSummaries(likedSummariesData)
          // setSavedSummaries(savedSummariesData)
          // setUserRepositories(allReposData)
          // setLikedRepositories(likedReposData)
          // setSavedRepositories(savedReposData)

          if (userData.communities && userData.communities.length > 0) {
            const communitiesData = await Promise.all(
              userData.communities.map(communityId => getCommunityById(communityId))
            )
            setUserCommunities(communitiesData.filter(community => community !== null))
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  const handleSearch = (e) => {
    e.preventDefault()
    console.log("Searching in profile:", searchTerm)
    // Implement search functionality here
  }

  const navigateToRepository = (repo) => {
    router.push(`/repository/${repo.id}?userId=${userId}`);
  }

  const navigateToSummary = (summary) => {
    router.push(`/summary/${summary.id}?userId=${userId}`);
  }

  const navigateToCommunity = (community) => {
    router.push(`/community/${community.id}?userId=${userId}`);
  }

  const handleEditProfile = () => {
    setIsEditProfileOpen(true)
  }

  const handleSaveProfile = async (updatedUser) => {
    try {
      
      // await updateUser(updatedUser)

      setUser(updatedUser)
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const togglePrivateRepos = () => {
    setShowPrivateRepos(!showPrivateRepos)
  }

  const togglePrivateCommunities = () => {
    setShowPrivateCommunities(!showPrivateCommunities)
  }

  const togglePrivateSummaries = () => {
    setShowPrivateSummaries(!showPrivateSummaries)
  }

  const filterRepositories = (repositories) => {
    return repositories.filter(repo => !repo.isPrivate || showPrivateRepos)
  }

  const filterCommunities = (communities) => {
    return communities.filter(community => community.joinPolicy === "open" || showPrivateCommunities)
  }

  const filterSummaries = (summaries) => {
    return summaries.filter(summary => !summary.isPrivate || showPrivateSummaries)
  }

  if (isLoading) {
    return <RandomLoadingComponent />
  }

  const filteredUserRepositories = filterRepositories(userRepositories)
  const ownedRepositories = filteredUserRepositories.filter(repo => repo.owner === userId)
  const collaboratingRepositories = filteredUserRepositories.filter(repo => repo.collaborators && repo.collaborators.includes(userId))
  console.log("filteredUserRepositories:", filteredUserRepositories)
  const memberRepositories = filteredUserRepositories.filter(repo => repo.members && repo.members.includes(userId) && repo.owner !== userId && (!repo.collaborators || !repo.collaborators.includes(userId)))
  const filteredLikedRepositories = filterRepositories(likedRepositories)
  const filteredSavedRepositories = filterRepositories(savedRepositories)
  const filteredUserCommunities = filterCommunities(userCommunities)
  const filteredUserSummaries = filterSummaries(userSummaries)
  const filteredLikedSummaries = filterSummaries(likedSummaries)
  const filteredSavedSummaries = filterSummaries(savedSummaries)

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={null} userId={user?.id} />

      <main className="container mx-auto px-4 py-8">
        <Link
          href={`/dashboard?userId=${userId}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="mb-8 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24 border-4 border-orange-200 shadow-md">
                {user && user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name || 'User avatar'} />
                ) : (
                  <AvatarFallback className="bg-orange-300 text-orange-800 text-2xl font-bold">
                    {user ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-orange-800">
                  {user ? user.name : 'User Not Found'}
                </h1>
                {user && (
                  <>
                    <p className="text-orange-600 font-medium">@{user.username}</p>
                    <p className="mt-2 text-gray-700 max-w-md">{user.bio}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                      <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                        <Users className="w-4 h-4" />
                        <span>{user.followers.toLocaleString()} Followers</span>
                      </Badge>
                      <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                        <User className="w-4 h-4" />
                        <span>{user.following} Following</span>
                      </Badge>
                      <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                        <BookOpen className="w-4 h-4" />
                        <span>{user.summariesCount} Summaries</span>
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              {user && (
                <div className="mt-4 md:mt-0 md:ml-auto">
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-100" onClick={handleEditProfile}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="summaries" className="space-y-4">
          <TabsList className="bg-white bg-opacity-70 backdrop-blur-sm">
            <TabsTrigger
              value="summaries"
              className="data-[state=active]:bg-orange-200"
            >
              Summaries
            </TabsTrigger>
            <TabsTrigger
              value="repositories"
              className="data-[state=active]:bg-orange-200"
            >
              Repositories
            </TabsTrigger>
            <TabsTrigger
              value="communities"
              className="data-[state=active]:bg-orange-200"
            >
              Communities
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="data-[state=active]:bg-orange-200"
            >
              Liked
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-orange-200"
            >
              Saved
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summaries">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-orange-800">My Summaries</CardTitle>
                <CardDescription className="text-orange-600">Summaries you've created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button
                    onClick={togglePrivateSummaries}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-100"
                  >
                    {showPrivateSummaries ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {showPrivateSummaries ? "Hide Private Summaries" : "Show Private Summaries"}
                  </Button>
                </div>
                <div className="h-[400px] overflow-y-auto pr-4">
                  {filteredUserSummaries.map((summary) => (
                    <SummaryCard
                      key={summary.id}
                      summary={summary}
                      onClick={() => navigateToSummary(summary)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="repositories">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-orange-800">My Repositories</CardTitle>
                <CardDescription className="text-orange-600">
                  Repositories you've created or contributed to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button
                    onClick={togglePrivateRepos}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-100"
                  >
                    {showPrivateRepos ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {showPrivateRepos ? "Hide Private Repositories" : "Show Private Repositories"}
                  </Button>
                </div>
                <div className="h-[400px] overflow-y-auto pr-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Owned Repositories
                    </h3>
                    {ownedRepositories.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigateToRepository(repo)}
                        isPrivate={repo.isPrivate}
                        isOwner={true}
                        role="owner"
                      />
                    ))}
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Collaborating Repositories
                    </h3>
                    {collaboratingRepositories.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigateToRepository(repo)}
                        isPrivate={repo.isPrivate}
                        isOwner={false}
                        role="collaborator"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="communities">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-orange-800">My Communities</CardTitle>
                <CardDescription className="text-orange-600">Communities you're a part of</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button
                    onClick={togglePrivateCommunities}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-100"
                  >
                    {showPrivateCommunities ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {showPrivateCommunities ? "Show All Communities" : "Show Open Communities Only"}
                  </Button>
                </div>
                <div className="h-[400px] overflow-y-auto pr-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Administrated Communities
                    </h3>
                    {filteredUserCommunities
                      .filter(community => community.admins && community.admins.includes(userId) && community.owner !== userId)
                      .map((community) => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                          onClick={() => navigateToCommunity(community)}
                          role="admin"
                        />
                      ))}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Member Communities
                    </h3>
                    {filteredUserCommunities
                      .filter(community => community.members && community.members.includes(userId) && community.owner !== userId && (!community.admins || !community.admins.includes(userId)))
                      .map((community) => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                          onClick={() => navigateToCommunity(community)}
                          role="member"
                        />
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="liked">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-orange-800">Liked Content</CardTitle>
                <CardDescription className="text-orange-600">
                  Summaries and repositories you've liked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button
                    onClick={togglePrivateRepos}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-100 mr-2"
                  >
                    {showPrivateRepos ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {showPrivateRepos ? "Hide Private Repositories" : "Show Private Repositories"}
                  </Button>
                  <Button
                    onClick={togglePrivateSummaries}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-100"
                  >
                    {showPrivateSummaries ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {showPrivateSummaries ? "Hide Private Summaries" : "Show Private Summaries"}
                  </Button>
                </div>
                <div className="h-[400px] overflow-y-auto pr-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Liked Summaries
                    </h3>
                    {filteredLikedSummaries.map((summary) => (
                      <SummaryCard
                        key={summary.id}
                        summary={summary}
                        onClick={() => navigateToSummary(summary)}
                      />
                    ))}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Liked Repositories
                    </h3>
                    {filteredLikedRepositories.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigateToRepository(repo)}
                        isPrivate={repo.isPrivate}
                        isOwner={repo.owner === userId}
                        role={repo.owner === userId ? "owner" : repo.collaborators && repo.collaborators.includes(userId) ? "collaborator" : "member"}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="saved">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-orange-800">Saved Content</CardTitle>
                <CardDescription className="text-orange-600">
                  Summaries and repositories you've saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button
                    onClick={togglePrivateRepos}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-100 mr-2"
                  >
                    {showPrivateRepos ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {showPrivateRepos ? "Hide Private Repositories" : "Show Private Repositories"}
                  </Button>
                  <Button
                    onClick={togglePrivateSummaries}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-100"
                  >
                    {showPrivateSummaries ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {showPrivateSummaries ? "Hide Private Summaries" : "Show Private Summaries"}
                  </Button>
                </div>
                <div className="h-[400px] overflow-y-auto pr-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Saved Summaries
                    </h3>
                    {filteredSavedSummaries.map((summary) => (
                      <SummaryCard
                        key={summary.id}
                        summary={summary}
                        onClick={() => navigateToSummary(summary)}
                      />
                    ))}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Saved Repositories
                    </h3>
                    {filteredSavedRepositories.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigateToRepository(repo)}
                        isPrivate={repo.isPrivate}
                        isOwner={repo.owner === userId}
                        role={repo.owner === userId ? "owner" : repo.collaborators && repo.collaborators.includes(userId) ? "collaborator" : "member"}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      {user && (
        <EditProfileModal
          user={user}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}