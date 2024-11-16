import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, UserMinus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchUserById } from '@/lib/db'
import OwnerCard from '@/components/Cards/OwnerCard'
import { Repository, RepositoryItem, RepositoryFolder, User } from '@/lib/types'



interface CollaboratorInvitationProps {
  userId: string
  collaborators: string[]
  pendingCollaborators: string[]
  onRemoveCollaborator: (userId: string) => void
  onCancelInvitation: (userId: string) => void
}

export const CollaboratorInvitation: React.FC<CollaboratorInvitationProps> = ({
  userId,
  collaborators,
  pendingCollaborators,
  onRemoveCollaborator,
  onCancelInvitation
}) => {

  const [collaboratorUsers, setCollaboratorUsers] = useState<User[]>([])
  const [pendingUsers, setPendingUsers] = useState<User[]>([])

  async function fetchUserByIdNew(userId: string) {
    try {
      const response = await fetch(`/api/users/findUser?id=${userId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const user = await response.json();
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error; // rethrow the error so Promise.all can handle it if necessary
    }
  }
  

  useEffect(() => {
    const fetchUsers = async () => {
      const collaboratorData = await Promise.all(collaborators.map(id => fetchUserByIdNew(id)))
      const pendingData = await Promise.all(pendingCollaborators.map(id => fetchUserByIdNew(id)))
      setCollaboratorUsers(collaboratorData.filter(Boolean) as User[])
      setPendingUsers(pendingData.filter(Boolean) as User[])
    }

    fetchUsers()
  }, [collaborators, pendingCollaborators])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-orange-700">Current Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
          {collaborators.length > 0 ? (
            <ul className="space-y-3">
              {collaboratorUsers.map((owner) => (
                <li key={owner.id} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <OwnerCard owner={owner} viewingUserId={userId} />
                  <Button
                    onClick={() => onRemoveCollaborator(owner.id)}
                    variant="destructive"
                    size="sm"
                    className="ml-3 bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No current collaborators</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-orange-700">Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCollaborators.length > 0 ? (
            <ul className="space-y-3">
              {pendingUsers.map((owner) => (
                <li key={owner.id} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <OwnerCard owner={owner} viewingUserId={userId} />
                  <Button 
                    onClick={() => onCancelInvitation(owner.id)} 
                    variant="outline" 
                    size="sm"
                    className="ml-3 h-17 border-orange-500 text-orange-500 hover:bg-orange-100 transition-colors duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Invitation
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No pending invitations</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}