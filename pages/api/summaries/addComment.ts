// pages/api/summaries/addComment.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { summaryId, commentId } = req.body;

        if (!summaryId || !commentId) {
            return res.status(400).json({ success: false, message: "Both summaryId and commentId are required." });
        }

        try {
            await dbConnect();

            // Find the summary by custom 'id' field and add the comment ID to its comments array
            const updatedSummary = await Summary.findOneAndUpdate(
                { id: summaryId },  // Using custom 'id' field
                { $push: { comments: commentId } },
                { new: true }
            );

            if (!updatedSummary) {
                console.error(`Summary with ID ${summaryId} not found.`);
                return res.status(404).json({ success: false, message: "Summary not found." });
            }

            res.status(200).json({ success: true, summary: updatedSummary });
        } catch (error) {
            console.error("Error adding comment to summary:", error);
            res.status(500).json({ success: false, message: "Failed to add comment to summary." });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
