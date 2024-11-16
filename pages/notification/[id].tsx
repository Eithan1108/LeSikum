'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, Bell, CheckCircle, ExternalLink, UserPlus, ThumbsUp, MessageSquare, BookOpen, Users, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { fetchUserById, updateUser, fetchRepositoryById, fetchCommunityById, fetchNotifications, markNotificationAsRead } from "@/lib/db"
import { User, Notification, Repository, Community } from "@/lib/types"
import { CollaborationRequestDialog } from "@/components/Collaborator/CollaborationRequestDialog"
import RandomLoadingComponent from '@/components/ui/Loading'

export default function NotificationPage() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [selectedInviter, setSelectedInviter] = useState<User | null>(null)
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [selectedRequester, setSelectedRequester] = useState<User | null>(null)
  const [collaborationDialogOpen, setCollaborationDialogOpen] = useState(false)
  const [joinRequestDialogOpen, setJoinRequestDialogOpen] = useState(false)

  // Function to mark all notifications as read
async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const response = await fetch("/api/notifications/markAllAsRead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notifications as read');
    }

    const data = await response.json();

    if (data.success) {
      console.log(data.message);
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
}

const fetchCommunityByIdNew = async (id: string) => {
  try {
    // Send GET request to the API with the community ID
    const response = await fetch(`/api/communities/getCommunityById?id=${id}`, {
      method: "GET",
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error("Failed to fetch community data");
    }

    // Parse the response JSON data
    const data = await response.json();

    if (data.success) {
      return data.community; // Return community data if successful
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error fetching community:", error);
    throw error; // Propagate the error
  }
};


const fetchUserByName = async (name: string) => {
  try {
    const response = await fetch(`/api/users/getUserByName?name=${name}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await response.json();
    if (data.success) {
      return data.user; // Return user data if successful
    } else {
      throw new Error(data.error || "Unknown error");
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error; // Propagate error
  }
};


  useEffect(() => {
    const fetchData = async () => {
      // Extract userId from URL path
      const pathname = window.location.pathname
      const userId = pathname.split("/").pop()

      if (userId) {
        setIsLoading(true)
        
        try {
          // Fetch the user data synchronously
          const response = await fetch(`/api/users/findUser?id=${userId}`)
          if (!response.ok) {
            throw new Error("Failed to fetch user")
          }

          const userData = await response.json()
          console.log("Fetched user:", userData)
          setUser(userData)

          // Only fetch notifications if user data is fetched and userId is valid
          if (userData.id) {
            const notifications = await fetchNotificationsNew(userData.id)
            setAllNotifications(notifications)
            markAllNotificationsAsRead(userData.id)
            console.log("Fetched notifications:", notifications)
          } else {
            console.warn("User ID is null or invalid.")
          }
          
        } catch (error) {
          console.error("Failed to fetch user data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchData()
  }, [])

  const fetchNotificationsNew = async (userId: string) => {
    try {
      const response = await fetch(`/api/notifications/getUserNotifications?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      const data = await response.json()
      console.log("Fetched notifications server:", data)
      return data.notifications
    } catch (error) {
      console.error("Error fetching notifications:", error)
      return []
    }
  }

  async function fetchRepositoryByIdNew(id: string) {
    try {
      const response = await fetch(`/api/repositories/getRepositoryById?id=${id}`);
  
      if (!response.ok) {
        throw new Error('Failed to fetch repository');
      }
  
      const data = await response.json();
  
      if (!data.success) {
        throw new Error(data.message || 'Repository not found');
      }
  
      return data.repository;
    } catch (error) {
      console.error('Error fetching repository:', error);
      throw error; // Re-throw error to be handled by the calling function
    }
  };

  const handleCollaborationInvite = async (notification: Notification) => {
    const repoId = notification.link.split('/').pop()?.split('?')[0]
    if (!repoId) return

    try {
      const repo = await fetchRepositoryByIdNew(repoId)
      const inviter = await fetchUserByName(notification.sender)
      if (repo && inviter) {
        setSelectedRepo(repo)
        setSelectedInviter(inviter)
        setCollaborationDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching repository or inviter:", error)
    }
  }

  const handleJoinRequest = async (notification: Notification) => {
    const communityId = notification.link.split('/').pop()?.split('?')[0]
    if (!communityId) return

    try {
      const community = await fetchCommunityByIdNew(communityId)
      const requester = await fetchUserByName(notification.sender)
      if (community && requester) {
        setSelectedCommunity(community)
        setSelectedRequester(requester)
        setJoinRequestDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching community or requester:", error)
    }
  }

  if (isLoading) {
    return (
      <RandomLoadingComponent />
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-orange-50">
        <h1 className="text-2xl font-bold text-orange-800 mb-4">User not found</h1>
        <Link href="/dashboard" className="text-orange-600 hover:text-orange-800">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="h-5 w-5 text-orange-500" />;
      case 'like':
        return <ThumbsUp className="h-5 w-5 text-orange-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-orange-500" />;
      case 'mention':
        return <Bell className="h-5 w-5 text-orange-500" />;
      case 'summary':
        return <BookOpen className="h-5 w-5 text-orange-500" />;
      case 'collaboration_invite':
        return <Users className="h-5 w-5 text-orange-500" />;
      case 'join_request':
        return <Users className="h-5 w-5 text-orange-500" />;
      case 'join_accepted':
        return <Check className="h-5 w-5 text-orange-500" />;
      case 'join_rejected':
        return <X className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-orange-500" />;
    }
  };

  const getActionLink = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return (
          <Link 
            href={`/view_user_profile/${notification.sender}?viewerId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Profile
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      case 'like':
        return (
          <Link 
            href={`/${notification.link}?userId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Liked Summary
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      case 'comment':
        return (
          <Link 
            href={`/${notification.link}?userId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Comment
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      case 'mention':
        return (
          <Link 
            href={`/view_summary/${notification.link}?viewerId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Mention
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      case 'summary':
        return (
          <Link 
            href={`${notification.link}?userId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            Read Summary
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      case 'collaboration_invite':
        return (
          <Button
            onClick={() => handleCollaborationInvite(notification)}
            variant="link"
            className="inline-flex p-0 h-auto items-center font-normal text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Invitation
            <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        );
      case 'join_request':
        return (
          <Button
            onClick={() => handleJoinRequest(notification)}
            variant="link"
            className="inline-flex p-0 h-auto items-center font-normal text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Join Request
            <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        );
      case 'join_accepted':
      case 'join_rejected':
        return (
          <Link 
          href={`/${notification.link}?userId=${user.id}`}
          className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Community
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Notifications - LeSikum</title>
        <meta name="description" content="View your notifications" />
      </Head>

      <div className="min-h-screen bg-orange-50">
        <Header onSearch={() => {}} userId={user.id} />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <Link
              href={`/dashboard?userId=${user.id}`}
              className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-orange-800">Your Notifications</h1>
          </div>

          <Card className="mb-8 bg-white bg-opacity-90 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-orange-100">
              <CardTitle className="flex items-center text-orange-800">
                <Bell className="mr-2 h-6 w-6 text-orange-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {allNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="mx-auto h-12 w-12 text-orange-300 mb-2" />
                  <p className="text-lg font-medium">You have no notifications.</p>
                </div>
              ) : (
                <ul className="divide-y divide-orange-100">
                  {allNotifications
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((notification) => (
                      <li key={notification.id} className="p-6 hover:bg-orange-50 transition-colors duration-200">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 bg-orange-100 rounded-full p-2">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-semibold text-orange-800 text-lg">{notification.sender}</p>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-2 py-1">
                                <CheckCircle className="h-3 w-3 mr-1 inline" />
                                Read
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{new Date(notification.date).toLocaleString()}</p>
                            <p className="text-gray-700 mb-3">{notification.content}</p>
                            <div className="flex justify-between items-center">
                              {getActionLink(notification)}
                              <span className="text-xs text-gray-400">{notification.type}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
      {selectedRepo && selectedInviter && (
        <CollaborationRequestDialog
          isOpen={collaborationDialogOpen}
          onClose={() => setCollaborationDialogOpen(false)}
          repository={selectedRepo}
          inviter={selectedInviter}
          currentUserId={user.id}
        />
      )}
      {/* {selectedCommunity && selectedRequester && (
        <JoinRequestDialog
          isOpen={joinRequestDialogOpen}
          onClose={() => setJoinRequestDialogOpen(false)}
          community={selectedCommunity}
          requester={selectedRequester}
          currentUserId={user.id}
        />
      )} */}
    </>
  )
}