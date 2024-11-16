// File: pages/api/notifications/sendCommentNotification.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";
import Summary from "@/lib/models/Summary"; // Assuming a model for summaries exists

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API handler triggered for comment notification");
  console.log("Request method:", req.method);
  console.log("Request body:", req.body);

  if (req.method === "POST") {
    try {
      
      const { summaryId, newComment } = req.body;

      if (!summaryId || !newComment || !newComment.author) {
        return res.status(400).json({
          success: false,
          message: "Summary ID and comment information with an author are required."
        });
      }
      
      await dbConnect();
      console.log("Database connected");

      // Find the summary and its owner
      const summary = await Summary.findOne({ id: summaryId });
      if (!summary) {
        return res.status(404).json({
          success: false,
          message: "Summary not found."
        });
      }

      console.log("Summary found:", summary);

      const owner = await User.findOne({ id: summary.owner });
      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Summary owner not found."
        });
      }

      console.log("Summary and owner found:", summary, owner);

      // Create the new comment notification
      const newNotification = await Notification.create({
        id: Math.random().toString(36).substr(2, 9), // Generate a random ID for the notification
        date: new Date().toISOString(),
        read: false,
        content: `${newComment.author} commented on your summary "${summary.title}"`,
        link: `/summary/${summaryId}`,
        sender: newComment.author,
        type: "comment"
      });

      console.log("New notification created:", newNotification);

      // Add the notification ID to the summary owner's `notificationIds` array
      await User.updateOne(
        { id: owner.id },
        { $push: { notificationIds: newNotification.id } }
      );

      res.status(200).json({
        success: true,
        message: "Comment notification sent to the summary owner.",
        notification: newNotification
      });
    } catch (error) {
      console.error("Error sending comment notification:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while sending the comment notification."
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: "Endpoint not found."
    });
  }
}
