import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, MessageSquare, ThumbsUp, Users, GitBranch } from 'lucide-react'

interface Activity {
  id: string
  type: 'new_summary' | 'comment' | 'like' | 'join_community' | 'fork_repository'
  user: {
    id: string
    name: string
    avatar: string
  }
  target: {
    id: string
    title: string
  }
  timestamp: string
}

interface ActivityCardProps {
  activity: Activity
  onClick: (activity: Activity) => void
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
  const { type, user, target, timestamp } = activity

  const renderIcon = () => {
    switch (type) {
      case 'new_summary':
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case 'like':
        return <ThumbsUp className="h-5 w-5 text-red-500" />
      case 'join_community':
        return <Users className="h-5 w-5 text-purple-500" />
      case 'fork_repository':
        return <GitBranch className="h-5 w-5 text-orange-500" />
      default:
        return null
    }
  }

  const renderActivityText = () => {
    switch (type) {
      case 'new_summary':
        return `created a new summary: "${target.title}"`
      case 'comment':
        return `commented on "${target.title}"`
      case 'like':
        return `liked "${target.title}"`
      case 'join_community':
        return `joined the community: ${target.title}`
      case 'fork_repository':
        return `forked the repository: ${target.title}`
      default:
        return ''
    }
  }

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200" onClick={() => onClick(activity)}>
      <CardContent className="p-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">{user.name}</span>{' '}
              {renderActivityText()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
          </div>
          <div className="ml-2">{renderIcon()}</div>
        </div>
      </CardContent>
    </Card>
  )
}