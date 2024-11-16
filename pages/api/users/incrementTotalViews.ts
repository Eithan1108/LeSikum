import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User"; 
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            // Retrieve the userId from the query string (not the body)
            const { id } = req.query;  // Use req.query to get the id from the URL query string

            // Check if `id` is provided
            if (!id || typeof id !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required and should be a string.",
                });
            }

            // Connect to the database
            await dbConnect();

            // Use the custom `id` and increment the `TotalViews` field by 1
            const updatedUser = await User.findOneAndUpdate(
                { id },  // Replace this with your actual custom ID field
                { $inc: { totalViews: 1 } },  // Increment the TotalViews field by 1
                { new: true }
            );

            // Check if user was found and updated
            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            // Send a success response
            res.status(200).json({
                success: true,
                message: "TotalViews updated successfully",
                user: updatedUser,
            });
        } catch (error) {
            console.error("Error updating user:", error);
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
