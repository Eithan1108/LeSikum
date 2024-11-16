import { Document, Schema, model, models } from "mongoose";

export interface IRepository extends Document {
  id: string;
  name: string;
  description: string;
  author: string;
  owner: string;
  isPrivate: boolean;
  stars: number;
  likes: number;
  views: number;
  tags: string[];
  rootFolder: RepositoryFolder;
  collaborators: string[];
  pendingCollaborators: string[];
}

export interface RepositoryFolder {
  id: string;
  name: string;
  items: (RepositoryItem | RepositoryFolder)[];
  path: string[];
}

export interface RepositoryItem {
  id: string;
  title: string;
  description: string;
  author: string;
  lastUpdated: Date;
  views: number;
  likes: number;
  comments: number;
  path: string[];
  owner?: string;
  isPrivate?: boolean;
}

// Define the RepositoryItem Schema
const RepositoryItemSchema: Schema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
  views: { type: Number, required: true, default: 0 },
  likes: { type: Number, required: true, default: 0 },
  comments: { type: Number, required: true, default: 0 },
  path: { type: [String], required: true },
  owner: { type: String },
  isPrivate: { type: Boolean, default: false },
});

// Define the RepositoryFolder Schema
const RepositoryFolderSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  items: [{ type: Schema.Types.Mixed, required: true }],  // Can be RepositoryItem or RepositoryFolder
  path: { type: [String], required: true },
});

// Define the Repository Schema
const RepositorySchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  owner: { type: String, required: true },
  isPrivate: { type: Boolean, required: true, default: false },
  stars: { type: Number, required: true, default: 0 },
  likes: { type: Number, required: true, default: 0 },
  views: { type: Number, required: true, default: 0 },
  tags: { type: [String], required: false },
  rootFolder: { type: RepositoryFolderSchema, required: true },
  collaborators: [{ type: String, required: false }],
  pendingCollaborators: [{ type: String, required: false }],
});

export default models.Repository || model<IRepository>("Repository", RepositorySchema);
