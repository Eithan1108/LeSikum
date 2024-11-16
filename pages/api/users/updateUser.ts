import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User"; 
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            // Destructure userId and updateData from the request body
            const { id, ...updateData } = req.body;

            // Connect to the database
            await dbConnect();

            // Use the custom `id` instead of `_id`
            const updatedUser = await User.findOneAndUpdate(
                { id },  // Replace this with your actual custom ID field
                updateData,
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
                message: "User updated successfully",
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
