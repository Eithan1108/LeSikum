// File: pages/api/notifications/hasUnreadNotifications.js

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            await dbConnect();
            console.log("Database connected");

            // Get user ID from query parameters
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required."
                });
            }

            // Find the user by custom ID
            const user = await User.findOne({ id: userId });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            console.log("User's notificationIds:", user.notificationIds);

            // Check if there is at least one unread notification
            const hasUnread = await Notification.exists({
                id: { $in: user.notificationIds },
                read: false
            });

            res.status(200).json({
                success: true,
                hasUnread: !!hasUnread  // Boolean indicating if there's an unread notification
            });
        } catch (error) {
            console.error("Error checking for unread notifications:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while checking for unread notifications."
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Endpoint not found."
        });
    }
}
