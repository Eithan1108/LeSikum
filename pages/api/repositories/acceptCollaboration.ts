// pages/api/repositories/acceptCollaboration.ts

import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import User from "@/lib/models/User";
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

      // Fetch the repository and user by ID
      const repo = await Repository.findOne({ id: repoId });
      const user = await User.findOne({ id: userId });

      if (!repo) {
        return res.status(404).json({
          success: false,
          message: "Repository not found.",
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Check if the user is in pending collaborators
      if (!repo.pendingCollaborators.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "User does not have a pending invitation.",
        });
      }

      // Remove the user from pending collaborators and add them to collaborators
      repo.pendingCollaborators = repo.pendingCollaborators.filter((id: string) => id !== userId);
      repo.collaborators.push(userId);

      // Save the updated repository
      await repo.save();

      return res.status(200).json({
        success: true,
        message: "Collaboration accepted successfully.",
        repository: repo,
      });
    } catch (error) {
      console.error("Error accepting collaboration:", error);
      return res.status(500).json({
        success: false,
        message: "Error accepting collaboration.",
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }
}