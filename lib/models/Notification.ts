import { Document, Schema, model, models } from "mongoose";

// Notification types
export type NotificationType = 'follow' | 'like' | 'comment' | 'mention' | 'summary' | 'collaboration_invite' | 'join_request' | 'join_accepted' | 'join_rejected';

export interface INotification extends Document {
  id: string;
  date: string;
  read: boolean;
  content: string;
  link: string;
  sender: string;
  type: NotificationType;
}

const notificationSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
  },
  date: {
    type: String, // You may want to use Date type here if you prefer a Date object
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'follow',
      'like',
      'comment',
      'mention',
      'summary',
      'collaboration_invite',
      'join_request',
      'join_accepted',
      'join_rejected',
    ],
    required: true,
  },
});

// Export the model
const Notification = models.Notification || model<INotification>("Notification", notificationSchema);
export default Notification;
