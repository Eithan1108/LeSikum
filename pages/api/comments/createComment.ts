import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/lib/models/Comment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            const { author, content, timestamp } = req.body;

            // Check for missing fields
            if (!author || !content || !timestamp) {
                return res.status(400).json({ success: false, message: "All fields are required." });
            }

            // Connect to the database
            await dbConnect();

            const id = Date.now().toString();

            // Create and save a new comment
            const newComment = new Comment({ id, author, content, timestamp });
            await newComment.save();

            res.status(201).json({
                success: true,
                message: "Comment created successfully.",
                comment: newComment,
            });
        } catch (error) {
            console.error("Error creating comment:", error);
            res.status(500).json({ success: false, message: "Failed to create comment." });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
