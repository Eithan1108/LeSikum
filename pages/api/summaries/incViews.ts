import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary"; // Import your Summary model
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            // Retrieve the summaryId from the query string
            const { id } = req.query;

            // Validate the id
            if (!id || typeof id !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: "Summary ID is required and should be a string.",
                });
            }

            // Connect to the database
            await dbConnect();

            // Increment the `views` field of the summary
            const updatedSummary = await Summary.findOneAndUpdate(
                { id },  // Assuming you're using a custom `id` for summaries
                { $inc: { views: 1 } },  // Increment the `views` field by 1
                { new: true }  // Return the updated summary
            );

            // Check if the summary was found and updated
            if (!updatedSummary) {
                return res.status(404).json({
                    success: false,
                    message: "Summary not found.",
                });
            }

            // Send a success response
            res.status(200).json({
                success: true,
                message: "Summary views incremented successfully",
                summary: updatedSummary,
            });
        } catch (error) {
            console.error("Error incrementing summary views:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed.",
        });
    }
}
