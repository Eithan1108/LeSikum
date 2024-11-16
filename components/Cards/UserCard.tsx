import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Check } from "lucide-react"

interface UserCardProps {
  user: {
    id: string
    name: string
    username: string
    avatar: string
    bio: string
  }
  onClick: () => void
  isFollowing?: boolean
  onFollowToggle?: () => void
}

export function UserCard({ user, onClick, isFollowing = false, onFollowToggle }: UserCardProps = { 
  user: { id: '', name: '', username: '', avatar: '', bio: '' }, 
  onClick: () => {}, 
  isFollowing: false, 
  onFollowToggle: () => {} 
}) {



  return (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={onClick}>
      <CardContent className="p-4 flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h3 className="font-semibold text-lg text-orange-700">{user.name}</h3>
          <p className="text-sm text-orange-600">@{user.username}</p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</p>
        </div>
      </CardContent>
    </Card>
  )
}