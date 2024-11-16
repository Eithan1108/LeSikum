import { Document, Schema, model, models } from "mongoose"

// User related types
type UserStatus = 'new' | 'active' | 'inactive'

export interface IUser extends Document {
    email: string
    id: string
    name: string
    password: string
    username: string
    avatar?: string
    bio?: string
    followers?: number
    following?: number
    summariesCount?: number
    totalLikes?: number
    totalViews?: number
    rate?: number
    status?: UserStatus
    likedSummaries?: string[]
    savedSummaries?: string[]
    likedRepositories?: string[]
    savedRepositories?: string[]
    followingId?: string[]
    followerIds?: string[]
    notificationIds?: string[]; // Replace notifications: Notification[]
    communities?: string[];
    // Add this field to store the IDs of communities the user is a member of
  }
  
  const userSchema:Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {type: String, default: "Hello, I am a student"},
    followers: {type: Number, default: 0},
    following: {type: Number, default: 0},
    summariesCount: {type: Number, default: 0},
    totalLikes: {type: Number, default: 0},
    totalViews: {type: Number, default: 0},
    rate: {type: Number, default: 0},
    status: {type: String, default: "new"},
    likedSummaries: Array<String>,
    savedSummaries: Array<String>,
    likedRepositories: Array<String>,
    savedRepositories: Array<String>,
    followingId: Array<String>,
    followerIds: Array<String>,
    notificationIds: Array<String>, // Replace notifications: Notification[]
    communities: Array<String>,
  })

  const User = models.User || model<IUser>("User", userSchema);
  export default User;
  