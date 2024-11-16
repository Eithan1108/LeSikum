import { Document, Schema, model, models } from "mongoose";

export interface IComment extends Document {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

const commentSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
});

// Export the model
const Comment = models.Comment || model<IComment>("Comment", commentSchema);
export default Comment;
