'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Input from "@/components/ui/SeconInput"
import { ArrowLeft, Users, MessageSquare, BookOpen, Calendar, Shield, Settings, PlusCircle, Search, Star, TrendingUp, Eye, ThumbsUp, GitFork, FileCode, UserPlus, Award, Lock } from "lucide-react"
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { RepositoryCard } from "@/components/Cards/RepositoryCard"
import { fetchCommunityById, fetchUserById, fetchRepositoryById, joinCommunity, leaveCommunity, requestToJoinCommunity } from '@/lib/db'
import { Community, User, Repository } from "@/lib/types"
import { JoinRequestDialog } from "@/components/Collaborator/JoinRequestDialog"
import OwnerCard from '@/components/Cards/OwnerCard'


async function fetchCommunityByIdNew (id: string) {
  try {
      const response = await fetch(`/api/communities/getCommunityById?id=${id}`);

      if (!response.ok) {
          // Handle non-2xx responses (e.g., 404, 500)
          const errorData = await response.json();
          throw new Error(errorData.message || 'Something went wrong');
      }

      const data = await response.json();

      if (data.success) {
          return data.community; // Return the community data if successful
      } else {
          throw new Error(data.message); // Handle API failure message
      }
  } catch (error) {
      console.error("Error fetching community:", error);
      throw new Error("Failed to fetch community data");
  }
};

async function fetchUserByIdNew (userId: string) {
  try {
      const response = await fetch(`/api/users/findUser?id=${userId}`);

      if (!response.ok) {
          // Handle non-2xx responses (e.g., 404, 500)
          const errorData = await response.json();
          
          throw new Error(errorData.message || 'Something went wrong');
      }

      const data = await response.json();
      console.log("data", data)
      

      if (data) {
        console.log("here")
          return data; // Return the user data if successful
      } else {
          throw new Error(data.message); // Handle API failure message
      }
  } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user data");
  }
};

async function fetchRepositoryByIdNew (repositoryId: string) {
  try {
      const response = await fetch(`/api/repositories/getRepositoryById?id=${repositoryId}`);

      if (!response.ok) {
          // Handle non-2xx responses (e.g., 404, 500)
          const errorData = await response.json();
          throw new Error(errorData.message || 'Something went wrong');
      }

      const data = await response.json();

      if (data.success) {
          return data.repository; // Return the repository data if successful
      } else {
          throw new Error(data.message); // Handle API failure message
      }
  } catch (error) {
      console.error("Error fetching repository:", error);
      throw new Error("Failed to fetch repository data");
  }
};




export default function CommunityPage() {
  const router = useRouter()
  const { id: communityId, userId } = router.query
  const [community, setCommunity] = useState<Community | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('about')
  const [searchTerm, setSearchTerm] = useState('')
  const [joinRequestsDialogOpen, setJoinRequestsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!router.isReady) return;

      if (typeof communityId !== 'string' || typeof userId !== 'string') {
        setError('Invalid URL parameters');
        setIsLoading(false);
        return;
      }

      try {
        const communityData = await fetchCommunityByIdNew(communityId);
        const userData = await fetchUserByIdNew(userId);
        console.log("userData", userData)

        

        if (!communityData) throw new Error('Community not found');
        if (!userData) throw new Error('User not found');

        setCommunity(communityData);
        setUser(userData);

        // Check if the user has access to the community
        const hasAccess = communityData.members.includes(userData.id) || 
                          communityData.admins.includes(userData.id) || 
                          ! (communityData.joinPolicy == "request");

        

        // Fetch repository data
        const repoPromises = communityData.repositories.map((repoId: string) => fetchRepositoryByIdNew(repoId));
        const repoData = await Promise.all(repoPromises);
        setRepositories(repoData.filter(repo => repo !== null) as Repository[]);

        // Fetch member data
        const memberPromises = communityData.members.map((memberId: string) => fetchUserByIdNew(memberId));
        const memberData = await Promise.all(memberPromises);
        setMembers(memberData.filter(member => member !== null) as User[]);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, router.query]);

  const handleSearch = (query: string) => {
    router.push(`/search?userId=${userId}&q=${query}`);
  }

  // src/lib/api/joinCommunity.ts
async function joinCommunityNew(userId: string, communityId: string) {
  try {
      const response = await fetch("/api/communities/joinCommunity", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, communityId }),
      });

      if (!response.ok) {
          throw new Error("Failed to join the community");
      }

      const data = await response.json();

      if (!data.success) {
          throw new Error(data.message || "Failed to join the community");
      }

      return {
          user: data.user,
          community: data.community,
      };
  } catch (error) {
      console.error("Error joining community:", error);
      throw error;
  }
}

// src/lib/api/leaveCommunity.ts
async function leaveCommunityNew(userId: string, communityId: string) {
  try {
      const response = await fetch("/api/communities/leaveCommunity", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, communityId }),
      });

      if (!response.ok) {
          throw new Error("Failed to leave the community");
      }

      const data = await response.json();

      if (!data.success) {
          throw new Error(data.message || "Failed to leave the community");
      }

      return {
          user: data.user,
          community: data.community,
      };
  } catch (error) {
      console.error("Error leaving community:", error);
      throw error;
  }
}

// src/lib/api/requestToJoinCommunity.ts
async function requestToJoinCommunityNew(userId: string, communityId: string) {
  try {
      const response = await fetch("/api/communities/requestToJoinCommunity", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, communityId }),
      });

      if (!response.ok) {
          throw new Error("Failed to request to join the community");
      }

      const data = await response.json();

      if (!data.success) {
          throw new Error(data.message || "Failed to request to join the community");
      }

      return {
          user: data.user,
          community: data.community,
      };
  } catch (error) {
      console.error("Error requesting to join community:", error);
      throw error;
  }
}


  const handleJoinLeave = async () => {
    if (!community || !user) return;

    try {
      if (isMember) {
        const { user: updatedUser, community: updatedCommunity } = await leaveCommunityNew(user.id, community.id);
        setUser(updatedUser);
        setCommunity(updatedCommunity);
        setMembers(prevMembers => prevMembers.filter(member => member.id !== user.id));
      } else if (community.joinPolicy === 'open') {
        const { user: updatedUser, community: updatedCommunity } = await joinCommunityNew(user.id, community.id);
        setUser(updatedUser);
        setCommunity(updatedCommunity);
        setMembers(prevMembers => [...prevMembers, updatedUser]);
      } else if (community.joinPolicy === 'request') {
        const { user: updatedUser, community: updatedCommunity } = await requestToJoinCommunityNew(user.id, community.id);
        setUser(updatedUser);
        setCommunity(updatedCommunity);
        alert('Your request to join has been sent to the community admins.');
      }
    } catch (error) {
      console.error('Error joining/leaving community:', error);
      alert('An error occurred. Please try again.');
    }
  }

  const handleUserClick = (clickedUserId: string) => {
    router.push(`/profile/${clickedUserId}?userId=${userId}`);
  }

  const handleFollowToggle = (followedUserId: string) => {
    // Implement follow/unfollow functionality
    console.log(`Toggle follow for user: ${followedUserId}`);
  }

  if (isLoading) return <div className="container mx-auto p-4 text-orange-600">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
  if (!community || !user) return <div className="container mx-auto p-4 text-orange-600">Community or user not found</div>

  const isAdmin = community.admins.includes(user.id)
  const isMember = community.members.includes(user.id)

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={handleSearch} userId={user.id} />

      <main className="container mx-auto px-4 py-8">
        <Link
          href={`/dashboard?userId=${user.id}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="mb-8 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24 border-4 border-orange-200 shadow-md">
                <AvatarImage src={'/placeholder.svg?height=96&width=96'} alt={community.name} />
                <AvatarFallback className="bg-orange-300 text-orange-800">{community.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-orange-800">
                  {community.name}
                  {community.joinPolicy == "request" && (
                    <Lock className="inline-block ml-2 w-6 h-6 text-orange-500" />
                  )}
                </h1>
                <p className="mt-2 text-orange-600 max-w-md">{community.description}</p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                    <Users className="w-4 h-4" />
                    <span>{community.totalMembers} Members</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                    <BookOpen className="w-4 h-4" />
                    <span>{community.totalContent} Content Items</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(community.creationDate).toLocaleDateString()}</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                    <Shield className="w-4 h-4" />
                    <span>Join Policy: {community.joinPolicy}</span>
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {!isAdmin && (
                  <Button 
                    onClick={handleJoinLeave} 
                    variant={isMember ? "outline" : "default"} 
                    className={isMember ? "border-orange-500 text-orange-500 hover:bg-orange-50" : "bg-orange-500 text-white hover:bg-orange-600"}
                    disabled={!isMember && community.joinPolicy === 'invite'}
                  >
                    {isMember ? 'Leave Community' : community.joinPolicy === 'request' ? 'Request to Join' : 'Join Community'}
                  </Button>
                )}
                {!isMember && community.joinPolicy === 'invite' && (
                  <p className="text-sm text-orange-600">This community requires an invitation to join.</p>
                )}
                {isAdmin && (
                  <Button 
                    onClick={() => setJoinRequestsDialogOpen(true)} 
                    variant="outline" 
                    className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Join Requests
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Community
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={`relative ${!isMember && community.joinPolicy == "request" ? 'filter blur-sm pointer-events-none' : ''}`}>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search in community..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white bg-opacity-70 backdrop-blur-sm">
              <TabsTrigger value="about" className="data-[state=active]:bg-orange-200">About</TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-orange-200">Members</TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-orange-200">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-orange-800">About {community.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-700 mb-4">{community.description}</p>
                    <h3 className="font-semibold text-orange-800 mb-2">Community Admins:</h3>
                    <ul className="list-disc list-inside text-orange-700">
                      {community.admins.map((adminId) => {
                        const admin = members.find(member => member.id === adminId);
                        return admin ? <li key={adminId}>{admin.name}</li> : null;
                      })}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-orange-800">Top Viewed Repositories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {repositories.length > 0 ? (
                      <ul className="space-y-4">
                        {repositories
                          .sort((a, b) => b.views - a.views)
                          .slice(0, 5)
                          .map((repo) => (
                            <RepositoryCard
                              key={repo.id}
                              repo={repo}
                              onClick={() => router.push(`/repository/${repo.id}?userId=${user.id}`)}
                          
                          
                            />
                          ))}
                      </ul>
                    ) : (
                      <p className="text-center text-orange-600 mt-4">No repositories yet in this community.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members">
              <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-orange-800">Community Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    {filteredMembers.map((member) => (
                      <OwnerCard key={member.id} owner={member} viewingUserId={user.id} />
                    ))}
                  </div>
                  {filteredMembers.length === 0 && (
                    <p className="text-center text-orange-600 mt-4">No members found matching your search.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-orange-800">Community Repositories</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredRepositories.length > 0 ? (
                    <div className="space-y-4">
                      {filteredRepositories.map((repo) => (
                        <RepositoryCard
                          key={repo.id}
                          repo={repo}
                          onClick={() => router.push(`/repository/${repo.id}?userId=${user.id}`)}
                          
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-orange-600 mt-4">No repositories found in this community.</p>
                  )}
                  {isAdmin && (
                    <Button 
                      className="mt-6 bg-orange-500 text-white hover:bg-orange-600"
                      onClick={() => router.push(`/create-repository?communityId=${community.id}&userId=${user.id}`)}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add New Repository
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {!isMember && community.joinPolicy == "request" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <Card className="bg-white p-6">
              <CardTitle className="text-xl font-bold mb-4">Join the Community</CardTitle>
              <CardDescription>You need to be a member to view the community content.</CardDescription>
              <Button 
                className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
                onClick={handleJoinLeave}
                
              >
                {community.joinPolicy === 'request' ? 'Request to Join' : 'Join Community'}
              </Button>
              <Link
                href={`/dashboard?userId=${user.id}`}
                className="ml-12 inline-flex items-center mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
              >
                Back to Dashboard
              </Link>
            </Card>
          </div>
        )}
      </main>
      {isAdmin && community && (
        <JoinRequestDialog
          isOpen={joinRequestsDialogOpen}
          onClose={() => setJoinRequestsDialogOpen(false)}
          community={community}
          onUpdateCommunity={(updatedCommunity) => setCommunity(updatedCommunity)}
        />
      )}
      <Footer />
    </div>
  )
}