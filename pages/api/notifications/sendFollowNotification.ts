// File: pages/api/notifications/sendFollowNotification.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API handler triggered");
  console.log("Request method:", req.method);
  console.log("Request body:", req.body);

  if (req.method === "POST") {
    try {
      console.log("Request body:", req.body); // Log the incoming request body

      const { followerId, followedId } = req.body;

      if (!followerId || !followedId) {
        return res.status(400).json({
          success: false,
          message: "Follower ID and followed ID are required."
        });
      }

      await dbConnect();
      console.log("Database connected");

      // Find the follower and the followed user
      const follower = await User.findOne({ id: followerId });
      const followedUser = await User.findOne({ id: followedId });

      console.log("Follower data:", follower);
      console.log("Followed user data:", followedUser);

      if (!follower) {
        return res.status(404).json({
          success: false,
          message: "Follower not found."
        });
      }

      if (!followedUser) {
        return res.status(404).json({
          success: false,
          message: "Followed user not found."
        });
      }

      console.log("Follower and followed users found.");

      // Create the new follow notification
      const newNotification = await Notification.create({
        id: Math.random().toString(36).substr(2, 9), // Generate a random id for the notification
        date: new Date().toISOString(),
        read: false,
        content: `${follower.name} started following you!`,
        link: `/profile/${follower.username}`,
        sender: follower.username,
        type: "follow"
      });

      console.log("New notification created:", newNotification);

      // Add the notification ID to the followed user's `notificationIds` array
      await User.updateOne(
        { id: followedId },
        { $push: { notificationIds: newNotification.id } }
      );

      res.status(200).json({
        success: true,
        message: "Follow notification sent to the followed user.",
        notification: newNotification
      });
    } catch (error) {
      console.error("Error sending follow notification:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while sending the follow notification."
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: "Endpoint not found."
    });
  }
}
