import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Star } from 'lucide-react'

interface Recommendation {
  id: string
  type: 'summary' | 'repository' | 'community'
  title: string
  description: string
  author?: string
  stars?: number
  members?: number
}

interface RecommendationCardProps {
  recommendation: Recommendation
  onClick: (recommendation: Recommendation) => void
}

export function RecommendationCard({ recommendation, onClick }: RecommendationCardProps) {
  const { type, title, description, author, stars, members } = recommendation

  const renderIcon = () => {
    switch (type) {
      case 'summary':
        return <BookOpen className="h-6 w-6 text-orange-500" />
      case 'repository':
        return <Star className="h-6 w-6 text-orange-500" />
      case 'community':
        return <Users className="h-6 w-6 text-orange-500" />
      default:
        return null
    }
  }

  const renderMetadata = () => {
    switch (type) {
      case 'summary':
        return author ? `by ${author}` : null
      case 'repository':
        return stars !== undefined ? `${stars} stars` : null
      case 'community':
        return members !== undefined ? `${members} members` : null
      default:
        return null
    }
  }

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-4 mt-1">{renderIcon()}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-700 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-2">{description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{renderMetadata()}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClick(recommendation)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}