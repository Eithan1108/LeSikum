import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("API called");
    if (req.method === "GET") {
      await dbConnect();

      const userId = req.query.id;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Query by the custom id field
      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      console.log("User:", user);
      res.status(200).json(user); // Send the user data back in the response
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
