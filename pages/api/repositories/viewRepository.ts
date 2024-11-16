import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository"; // Your repository model
import User from "@/lib/models/User"; // Your user model
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // Retrieve the repoId and userId from the request body
      const { repoId, userId } = req.body;

      // Validate input
      if (!repoId || typeof repoId !== 'string' || !userId || typeof userId !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Repository ID and User ID are required and should be strings.",
        });
      }

      // Connect to the database
      await dbConnect();

      // Find the repository by its ID
      const repository = await Repository.findOne({ id: repoId });

      // Check if the repository exists
      if (!repository) {
        return res.status(404).json({
          success: false,
          message: "Repository not found.",
        });
      }

      // Find the owner of the repository
      const owner = await User.findOne({ id: repository.owner });

      // Check if the owner exists
      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner not found.",
        });
      }

      // Increment the repository view count
      const updatedRepo = await Repository.findOneAndUpdate(
        { id: repoId },
        { $inc: { views: 1 } },
        { new: true }
      );

      // Increment the owner's view count (if necessary)
      const updatedOwner = await User.findOneAndUpdate(
        { id: owner.id },
        { $inc: { totalViews: 1 } },
        { new: true }
      );

      // Respond with updated data
      res.status(200).json({
        success: true,
        message: "Repository and owner view counts updated successfully",
        repository: updatedRepo,
        owner: updatedOwner,
      });
    } catch (error) {
      console.error("Error updating repository view count:", error);
      res.status(500).json({
        success: false,
        message: "Something went wrong while updating the view count.",
      });
    }
  } else {
    // Method not allowed
    res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }
}
