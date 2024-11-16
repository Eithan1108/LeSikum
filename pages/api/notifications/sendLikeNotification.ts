// File: pages/api/notifications/sendLikeNotification.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";
import Summary from "@/lib/models/Summary";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { userId, summaryId } = req.body;

      if (!userId || !summaryId) {
        return res.status(400).json({
          success: false,
          message: "User ID and summary ID are required."
        });
      }

      await dbConnect();

      // Find the user who liked the summary
      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found."
        });
      }
      console.log("User found:", user);

      // Find the summary and its owner
      const summary = await Summary.findOne({ id: summaryId });
      
      if (!summary) {
        console.log("Summary not found.");
        return res.status(404).json({
          success: false,
          message: "Summary not found."
        });
      }
      console.log("Summary found:", summary);

      

      const summaryOwner = await User.findOne({ id: summary.owner });
      if (!summaryOwner) {
        return res.status(404).json({
          success: false,
          message: "Summary owner not found."
        });
      }

      // Create the new like notification
      const newNotification = await Notification.create({
        id: Math.random().toString(36).substr(2, 9), // Generate a random ID for the notification
        date: new Date().toISOString(),
        read: false,
        content: `${user.name} liked your summary "${summary.title}"`,
        link: `/summary/${summaryId}`,
        sender: user.username,
        type: "like"
      });

      // Add the notification to the summary owner's notification IDs
      await User.updateOne(
        { id: summary.owner },
        { $push: { notificationIds: newNotification.id } }
      );

      res.status(200).json({
        success: true,
        message: "Like notification sent to the summary owner.",
        notification: newNotification
      });
    } catch (error) {
      console.error("Error sending like notification:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while sending the like notification."
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: "Endpoint not found."
    });
  }
}
