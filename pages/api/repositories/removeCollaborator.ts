// pages/api/repositories/removeCollaborator.ts

import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { repoId, userId } = req.body;
    
    if (!repoId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: repoId or userId.",
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

      // Check if the user is a collaborator
      if (!repo.collaborators.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "User is not a collaborator.",
        });
      }

      // Remove the user from the collaborators list
      repo.collaborators = repo.collaborators.filter((id: string) => id !== userId);

      // Save the updated repository
      await repo.save();

      return res.status(200).json({
        success: true,
        message: "Collaborator removed successfully.",
        repository: repo,
      });
    } catch (error) {
      console.error("Error removing collaborator:", error);
      return res.status(500).json({
        success: false,
        message: "Error removing collaborator.",
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }
}
