'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { acceptCollaboration, rejectCollaboration, fetchRepositoryById } from "@/lib/db"
import { Repository, User } from "@/lib/types"

interface CollaborationRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  repository: Repository
  inviter: User
  currentUserId: string
}

export function CollaborationRequestDialog({
  isOpen,
  onClose,
  repository,
  inviter,
  currentUserId
}: CollaborationRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [collaborationStatus, setCollaborationStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null)


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

  useEffect(() => {
    console.log('Checking collaboration status');
    const checkCollaborationStatus = async () => {
      if (isOpen) {
        const updatedRepo = await fetchRepositoryByIdNew(repository.id)
        if (updatedRepo) {
          if (updatedRepo.collaborators.includes(currentUserId)) {
            setCollaborationStatus('accepted')
          } else if (updatedRepo.pendingCollaborators.includes(currentUserId)) {
            setCollaborationStatus('pending')
          } else {
            setCollaborationStatus(null)
          }
        }
      }
    }

    checkCollaborationStatus()
  }, [isOpen, repository.id, currentUserId])

  const acceptCollaborationNew = async (repoId: string, userId: string) => {
    try {
      const response = await fetch("/api/repositories/acceptCollaboration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoId, userId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to accept collaboration");
      }
  
      const data = await response.json();
      if (data.success) {
        return data.repository; // Return the updated repository if successful
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error accepting collaboration:", error);
      throw error; // Propagate error
    }
  };
  

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await acceptCollaborationNew(repository.id, currentUserId)
      setCollaborationStatus('accepted')
    } catch (error) {
      console.error("Error accepting collaboration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to reject a collaboration invitation
async function rejectCollaborationNew(repoId: string, userId: string): Promise<Repository> {
  try {
    const response = await fetch(`/api/repositories/rejectCollaboration?repoId=${repoId}&userId=${userId}`, {
      method: "GET", // Using GET to trigger the API endpoint
    });

    if (!response.ok) {
      throw new Error("Failed to reject collaboration invitation");
    }

    const data = await response.json();
    if (data.success) {
      return data.repository; // Return the updated repository data
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error rejecting collaboration:", error);
    throw error; // Propagate the error
  }
}


  const handleReject = async () => {
    setIsLoading(true)
    try {
      await rejectCollaborationNew(repository.id, currentUserId)
      setCollaborationStatus('rejected')
    } catch (error) {
      console.error("Error rejecting collaboration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Collaboration Request</DialogTitle>
          <DialogDescription>
            {inviter.username} has invited you to collaborate on the repository "{repository.name}".
          </DialogDescription>
        </DialogHeader>
        {collaborationStatus === 'pending' && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={handleReject} variant="destructive" disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleAccept} disabled={isLoading}>
              <Check className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </div>
        )}
        {collaborationStatus === 'accepted' && (
          <div className="text-center text-green-600 mt-4">
            You have already accepted this collaboration request.
          </div>
        )}
        {collaborationStatus === 'rejected' && (
          <div className="text-center text-red-600 mt-4">
            You have already rejected this collaboration request.
          </div>
        )}
        {collaborationStatus === null && (
          <div className="text-center text-gray-600 mt-4">
            This collaboration request is no longer valid.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}