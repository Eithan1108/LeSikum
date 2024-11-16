import { Document, Schema, model, models } from "mongoose";

export interface ICommunity extends Document {
  id: string;
  name: string;
  description: string;
  members: string[];
  admins: string[];
  tags: string[];
  rules: string[];
  creationDate: Date;
  lastActivityDate: Date;
  totalMembers: number;
  totalContent: number;
  repositories: string[];
  joinPolicy: 'open' | 'request' | 'invite';
  pendingMembers: string[];
}



const CommunitySchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  members: [
    {
      type: String,
      required: true,
    },
  ],
  admins: [
    {
      type: String,
      required: true,
    },
  ],
  tags: [
    {
      type: String,
      required: false,
    },
  ],
  rules: [
    {
      type: String,
      required: false,
    },
  ],
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastActivityDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  totalMembers: {
    type: Number,
    required: true,
    default: 0,
  },
  totalContent: {
    type: Number,
    required: true,
    default: 0,
  },
  repositories: [
    {
      type: String,
      required: false,
    },
  ],
  joinPolicy: {
    type: String,
    enum: ['open', 'request', 'invite'],
    required: true,
    default: 'open',
  },
  pendingMembers: [
    {
      type: String,
      required: false,
    },
  ],
});

// export default mongoose.model<Community>('Community', CommunitySchema);

export default models.Community || model<ICommunity>("Community", CommunitySchema);

