import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Summary from "@/lib/models/Summary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const { userId } = req.query;

            await dbConnect();

            const user = await User.findOne({ id: userId }).populate("savedSummaries");

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            const savedSummaries = await Summary.find({ id: { $in: user.savedSummaries } });

            res.status(200).json({ success: true, savedSummaries });
        } catch (error) {
            console.error("Error fetching saved summaries:", error);
            res.status(500).json({ success: false, message: "Something went wrong." });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
