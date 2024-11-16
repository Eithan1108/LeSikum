import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API called");
  try {
    if (req.method === "GET") {
      await dbConnect();

      const username = req.query.username;
      if (!username) {
        return res.status(400).json({ success: false, error: "Username is required" });
      }

      // Query by the username field
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      
      console.log("User:", user);
      res.status(200).json({ success: true, user }); // Wrap user data in an object
    } else {
      res.status(405).json({ success: false, error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
