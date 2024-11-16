import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Clock, ThumbsUp, Bookmark, Eye } from "lucide-react"
import { Summary } from '../../lib/types'


interface SummaryCardProps {
  summary: Summary
  onClick: () => void
  showBookmark?: boolean
}

export function SummaryCard({ summary, onClick, showBookmark = false }: SummaryCardProps) {
  return (
    <Card className="mb-4 cursor-pointer hover:bg-orange-100" onClick={onClick}>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-orange-700 mb-2">
          {summary.title}
        </h3>
        <p className="text-sm text-orange-600 mb-3">
          {summary.description}
        </p>
        <div className="flex items-center text-sm text-orange-600">
          {summary.dateCreated && (
            <>
              <Clock className="mr-1 h-4 w-4" />
              <span className="mr-4">{summary.dateCreated}</span>
            </>
          )}
          <Eye className="mr-1 h-4 w-4" />
          <span className="mr-4">{summary.views} views</span>
          {showBookmark ? (
            <>
              <Bookmark className="mr-1 h-4 w-4" />
              <span className="mr-4">Saved</span>
            </>
          ) : (
            <>
              <ThumbsUp className="mr-1 h-4 w-4" />
              <span>{summary.likes} likes</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}