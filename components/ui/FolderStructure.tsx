import React, { useState } from 'react'
import { Folder, File } from 'lucide-react'

interface FolderItem {
  id: string;
  name: string;
  items: (FolderItem | SummaryItem)[];
}

interface SummaryItem {
  id: string;
  title: string;
}

interface FolderStructureProps {
  folder: FolderItem;
  onSelectSummary: (item: SummaryItem) => void;
  level?: number;
}

export function FolderStructure({ folder, onSelectSummary, level = 0 }: FolderStructureProps) {
  const [isOpen, setIsOpen] = useState(level === 0)

  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <button 
        className="flex items-center py-2 w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <Folder className="w-4 h-4 mr-2 text-orange-500" />
        ) : (
          <Folder className="w-4 h-4 mr-2 text-orange-300" />
        )}
        <span className="font-medium text-orange-700">{folder.name}</span>
      </button>
      {isOpen && (
        <div>
          {folder.items.map((item) => (
            'items' in item ? (
              <FolderStructure 
                key={item.id} 
                folder={item as FolderItem} 
                onSelectSummary={onSelectSummary} 
                level={level + 1} 
              />
            ) : (
              <button 
                key={item.id} 
                className="flex items-center py-2 w-full text-left hover:bg-orange-100" 
                style={{ marginLeft: `${(level + 1) * 20}px` }} 
                onClick={() => onSelectSummary(item as SummaryItem)}
              >
                <File className="w-4 h-4 mr-2 text-orange-400" />
                <span className="text-orange-600">{(item as SummaryItem).title}</span>
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}