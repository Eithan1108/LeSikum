import dbConnect from "@/lib/dbConnect";
import Community from "@/lib/models/Community";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { communityId, requesterId, adminId } = req.body;

    if (!communityId || !requesterId || !adminId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: communityId, requesterId, or adminId.",
      });
    }

    try {
      await dbConnect();

      // Fetch community and user data
      const community = await Community.findOne({ id: communityId });
      const requester = await User.findOne({ id: requesterId });

      if (!community || !requester) {
        return res.status(404).json({
          success: false,
          message: "Community or requester not found.",
        });
      }

      // Check if requester is in pendingMembers list
      if (!community.pendingMembers.includes(requesterId)) {
        return res.status(400).json({
          success: false,
          message: "User is not in the pending members list.",
        });
      }

      // Remove the requester from pendingMembers
      community.pendingMembers = community.pendingMembers.filter(
        (id: string) => id !== requesterId
      );

      // Create a rejection notification
      const newNotification = new Notification({
        id: Math.random().toString(36).substr(2, 9),
        type: "join_rejected",
        content: `Your request to join ${community.name} has been rejected.`,
        date: new Date().toISOString(),
        read: false,
        sender: adminId,
        link: `/community/${communityId}`,
      });

      // Save the notification
      const notification = await newNotification.save();

      // Add notification ID to the requester's notificationIds array
      if (!requester.notificationIds) {
        requester.notificationIds = [];
      }
      requester.notificationIds.push(notification.id);

      // Update both community and requester in the database
      await community.save();
      await requester.save();

      // Return the updated community
      return res.status(200).json({
        success: true,
        message: "Join request rejected successfully",
        community,
      });
    } catch (error) {
      console.error("Error rejecting join request:", error);
      return res.status(500).json({
        success: false,
        message: "Error rejecting join request.",
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
}
