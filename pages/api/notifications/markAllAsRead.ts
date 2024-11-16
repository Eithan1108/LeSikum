// File: pages/api/notifications/markAllAsRead.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // Connect to the database
      await dbConnect();
      console.log("Database connected");

      // Get the user ID from the request body
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required.",
        });
      }

      // Find the user to get their notificationIds
      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Get the user's notificationIds array
      const notificationIds = user.notificationIds;

      if (!notificationIds || notificationIds.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No notifications found for this user.",
        });
      }

      // Update the notifications that belong to the user and are unread
      const result = await Notification.updateMany(
        { id: { $in: notificationIds }, read: false }, // Filter by notificationIds and unread status
        { $set: { read: true } } // Set the notifications to read
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "No unread notifications found for this user.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read.",
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while marking notifications as read.",
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: "Endpoint not found.",
    });
  }
}
