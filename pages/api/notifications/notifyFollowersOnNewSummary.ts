import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("API handler triwwwggered");
    console.log("Request method:", req.method);
    console.log("Request body:", req.body);
    if (req.method === "POST") {
        try {
            console.log("Request body:", req.body);  // Log the incoming request body
            
            const { userId, summary } = req.body;

            if (!userId || !summary) {
                return res.status(400).json({
                    success: false,
                    message: "User ID and summary information are required."
                });
            }

            await dbConnect();

            console.log("Database connected");

            // Find the user who posted the summary
            const userData = await User.findOne({ id: userId });
            console.log("User data:", userData);
            if (!userData) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            console.log("User found:", userData);

            // Create the new notification
            const newNotification = await Notification.create({
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString(),
                read: false,
                content: `${userData.name} posted a new summary: "${summary.title}"`,
                link: `/summary/${summary.id}`,
                sender: userData.name,
                type: "summary"
            });

            console.log("New notification created:", newNotification);

            // Find all users who follow the summary's owner
            const followers = await User.find({ followingId: userId });
            console.log(`Found ${followers.length} followers.`);

            // Update each follower to add the notification ID to their `notificationIds` array
            const updateFollowersPromises = followers.map((follower) =>
                User.updateOne(
                    { id: follower.id },
                    { $push: { notificationIds: newNotification.id } }
                )
            );

            await Promise.all(updateFollowersPromises);

            res.status(200).json({
                success: true,
                message: "Notification sent to all followers.",
                notification: newNotification
            });
        } catch (error) {
            console.error("Error notifying followers:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while sending notifications."
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Endpoint not found."
        });
    }
}

