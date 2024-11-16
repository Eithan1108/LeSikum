// User related types
export type UserStatus = 'new' | 'active' | 'inactive'

export interface User {
  id: string
  name: string
  password: string
  username: string
  avatar: string
  bio: string
  followers: number
  following: number
  summariesCount: number
  totalLikes: number
  totalViews: number
  rate: number
  status: UserStatus
  likedSummaries: string[]
  savedSummaries: string[]
  likedRepositories: string[]
  savedRepositories: string[]
  followingId: string[]
  followerIds: string[]
  notificationIds: string[]; // Replace notifications: Notification[]
  communities: string[];
  // Add this field to store the IDs of communities the user is a member of
  
}

export interface NotificationStore {
  [id: string]: Notification;
}

// Notification types
export type NotificationType = 'follow' | 'like' | 'comment' | 'mention' | 'summary' | 'collaboration_invite' | 'join_request' | 'join_accepted' | 'join_rejected'


export interface Notification {
  id: string
  date: string
  read: boolean
  content: string
  link: string
  sender: string
  type: NotificationType
}

// Summary related types
export interface Summary {
  id: string
  owner: string
  title: string
  description: string
  content: string
  views: number
  likes: number
  comments: string[]
  dateCreated: string
  lastUpdated: string
  author: string
  tags: string[]
  neuronGraph: NeuronGraph
  isPrivate?: boolean
}

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
}

export interface NeuronGraph {
  [key: string]: NeuronTerm
}

export interface NeuronTerm {
  term: string
  definition: string
  relatedTerms: string[]
}

// Repository related types
export interface Repository {
  id: string
  name: string
  description: string
  author: string
  owner: string
  isPrivate: boolean
  stars: number
  likes: number
  views: number
  tags: string[]
  rootFolder: RepositoryFolder
  collaborators: string[] // Array of user IDs
  pendingCollaborators: string[] // Array of invited user IDs
  
  
}

export interface RepositoryFolder {
    id: string;
    name: string;
    items: (RepositoryItem | RepositoryFolder)[];
    path: string[];
}

export interface RepositoryItem {
  id: string
  title: string
  description: string
  author: string
  lastUpdated: string
  views: number
  likes: number
  comments: number
  path: string[]
  owner?: string
  isPrivate?: boolean
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type UserResponse = ApiResponse<User>
export type SummaryResponse = ApiResponse<Summary>
export type RepositoryResponse = ApiResponse<Repository>
export type UserListResponse = ApiResponse<User[]>
export type SummaryListResponse = ApiResponse<Summary[]>
export type RepositoryListResponse = ApiResponse<Repository[]>

// Search types
export interface SearchResult {
  type: 'user' | 'summary' | 'repository'
  item: User | Summary | Repository
}

export type SearchResponse = ApiResponse<SearchResult[]>

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  totalPages: number
  currentPage: number
}

// Additional utility types
export type SortOrder = 'asc' | 'desc'

export interface SortParams {
  field: string
  order: SortOrder
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[]
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

export interface Community {
  id: string;
  name: string;
  description: string;
  members: string[];
  admins: string[];
  tags: string[];
  rules: string[];
  creationDate: string;
  lastActivityDate: string;
  totalMembers: number;
  totalContent: number;
  repositories: string[];
  joinPolicy: 'open' | 'request' | 'invite';
  pendingMembers: string[];
}