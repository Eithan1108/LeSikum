// /api/owners/decrementTotalLikes.ts

import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            const { ownerId } = req.body;
            await dbConnect();

            const user = await User.findOne({ id: ownerId });
            if (!user) {
                return res.status(404).json({ success: false, message: "Owner not found." });
            }

            user.totalLikes = Math.max(0, user.totalLikes - 1);  // Ensure likes don't go negative
            await user.save();

            res.status(200).json({ success: true, message: "Owner total likes decremented.", user });
        } catch (error) {
            console.error("Error decrementing owner's total likes:", error);
            res.status(500).json({ success: false, message: "Something went wrong." });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
