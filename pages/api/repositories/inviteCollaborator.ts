import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Request bodyw:", req.body);
  if (req.method === "POST") {
    const { repoId, username } = req.body;
    console.log("Request body:", req.body);
    if (!repoId || !username) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: repoId or username.",
      });
    }

    try {
      await dbConnect();

      console.log(`Inviting ${username} to collaborate on repository ${repoId}`);

      // Fetch repository and user data
      const repo = await Repository.findOne({ id: repoId });
      const user = await User.findOne({ username: username });

      console.log("RepoF:", repo);
      console.log("UserF:", user);

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

      // Check if user is already a collaborator or has a pending invitation
      if (
        repo.collaborators.includes(user.id) ||
        repo.pendingCollaborators.includes(user.id)
      ) {
        return res.status(400).json({
          success: false,
          message: "User is already a collaborator or has a pending invitation.",
        });
      }

      // Add user to pending collaborators
      repo.pendingCollaborators.push(user.id);

      console.log("RepoSs:", repo);

      // Create a notification for the invited user
      const newNotification = new Notification({
        id: Math.random().toString(36).substr(2, 9),
        type: "collaboration_invite",
        content: `You've been invited to collaborate on the repository "${repo.name}"`,
        date: new Date().toISOString(),
        read: false,
        sender: repo.author,
        link: `/collaboration-request/${repoId}?userId=${user.id}`,
      });

      // Save the notification
      await newNotification.save();

      // Add notification ID to the user’s notifications array
      user.notificationIds.push(newNotification.id);

      // Update repository and user in the database
      await repo.save();
      await user.save();

      // Return the updated repository
      return res.status(200).json({
        success: true,
        message: "Collaborator invited successfully.",
        repository: repo,
      });
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      return res.status(500).json({
        success: false,
        message: "Error inviting collaborator.",
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
}
