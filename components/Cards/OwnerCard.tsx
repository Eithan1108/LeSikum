import Link from 'next/link'
import { ExternalLink, ThumbsUp, Eye, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User } from '../../lib/types'

interface OwnerCardProps {
  owner: User
  viewingUserId: string
}

export default function FullWidthOwnerCard({ owner, viewingUserId }: OwnerCardProps) {
  const isOwnProfile = owner.id === viewingUserId

  return (
    <Card className="w-full mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20 md:w-16 md:h-16">
              <AvatarImage src={owner.avatar} alt={owner.name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800 text-2xl font-semibold">
                {owner.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold text-orange-700">{owner.name}</h3>
              <p className="text-sm text-orange-600">@{owner.username}</p>
              {owner.bio && (
                <p className="mt-2 text-sm text-muted-foreground max-w-md hidden md:block">{owner.bio}</p>
              )}
            </div>
          </div>
          <div className="w-full h-px bg-border md:hidden" />
          <div className="flex flex-col md:flex-row justify-between md:justify-end items-start md:items-center w-full md:w-auto space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex justify-between w-full md:w-auto space-x-4 md:space-x-8">
              <StatItem icon={ThumbsUp} value={owner.totalLikes} label="Likes" />
              <StatItem icon={Eye} value={owner.totalViews} label="Views" />
              <StatItem icon={Users} value={owner.followers} label="Followers" />
            </div>
            <div className="w-full h-px bg-border md:hidden" />
            <Link 
              href={isOwnProfile ? `/profile?userId=${viewingUserId}` : `/view_user_profile/${owner.username}?viewerId=${viewingUserId}`} 
              className="w-full md:w-auto"
            >
              <Button variant="outline" size="sm" className="w-full md:w-auto whitespace-nowrap bg-orange-500 hover:bg-orange-600 hover:text-white text-white">
                {'View Full Profile'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatItemProps {
  icon: React.ElementType
  value: number
  label: string
}

function StatItem({ icon: Icon, value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center">
      <Icon className="w-5 h-5 mb-1 text-orange-700" />
      <p className="font-medium text-orange-700">{value.toLocaleString()}</p>
      <p className="text-xs text-orange-600">{label}</p>
    </div>
  )
}