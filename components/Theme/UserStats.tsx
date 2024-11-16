import React from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { FileText, Eye, ThumbsUp, Users, Star } from "lucide-react"

interface UserStatsProps {
  user: {
    summariesCount: number
    totalViews: number
    totalLikes: number
    followers: number
    rate: number
  }
}

export default function UserStats({ user }: UserStatsProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-100 to-orange-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-orange-800">Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatItem 
            icon={<FileText className="w-6 h-6 text-orange-600" />} 
            label="Total Summaries" 
            value={user.summariesCount.toLocaleString()} 
          />
          <StatItem 
            icon={<Eye className="w-6 h-6 text-orange-600" />} 
            label="Total Views" 
            value={user.totalViews.toLocaleString()} 
          />
          <StatItem 
            icon={<ThumbsUp className="w-6 h-6 text-orange-600" />} 
            label="Total Likes" 
            value={user.totalLikes.toLocaleString()} 
          />
          <StatItem 
            icon={<Users className="w-6 h-6 text-orange-600" />} 
            label="Followers" 
            value={user.followers.toLocaleString()} 
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="mb-2 p-2 bg-orange-100 rounded-full">{icon}</div>
      <p className="text-lg font-semibold text-orange-800 mb-1">{value}</p>
      <p className="text-xs text-orange-600 text-center">{label}</p>
    </div>
  )
}