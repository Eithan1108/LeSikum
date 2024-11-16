// File: pages/api/notifications/getUserNotifications.js

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

            // Find user by custom ID
            const user = await User.findOne({ id: userId });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }
            
            // Fetch notifications based on user's notification IDs (custom id)
            const notifications = await Notification.find({
                id: { $in: user.notificationIds }
            });
            console.log("Notifications found:", notifications);

            res.status(200).json({
                success: true,
                notifications
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while fetching notifications."
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Endpoint not found."
        });
    }
}
