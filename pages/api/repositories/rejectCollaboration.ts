// pages/api/repositories/rejectCollaboration.ts

import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

// Function to reject a collaboration (same as canceling the invitation)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { repoId, userId } = req.query; // Expecting repoId and userId as query params

    if (!repoId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID and User ID are required.",
      });
    }

    try {
      await dbConnect();

      // Fetch the repository by ID
      const repo = await Repository.findOne({ id: repoId });

      if (!repo) {
        return res.status(404).json({
          success: false,
          message: "Repository not found.",
        });
      }

      // Remove the user from pending collaborators
      repo.pendingCollaborators = repo.pendingCollaborators.filter(
        (id: string) => id !== userId
      );

      // Save the updated repository
      await repo.save();

      res.status(200).json({
        success: true,
        message: "Collaboration invitation rejected successfully.",
        repository: repo,
      });
    } catch (error) {
      console.error("Error rejecting collaboration:", error);
      res.status(500).json({
        success: false,
        message: "Error rejecting collaboration.",
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }
}
