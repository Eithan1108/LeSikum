import dbConnect from "@/lib/dbConnect"
import bcrypt from 'bcryptjs'
import User from "@/lib/models/User"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try 
        {
            const data = JSON.parse(req.body)
            await dbConnect()
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(data.password, salt)
            const userToCreate = {
                ...data,
                password: hashedPassword,
                id: Date.now().toString(),
              }
        
            const user = await User.create(userToCreate)
            
            res.status(200).json({
                success: true,
                message: user,
                userId: user.id
            })

            
            
        } catch(error) {
            console.error(error)
            res.status(300).json({
                success: false,
                message: "Something went wrong."
            })
        }
        

} else {
      res.status(300).json({
        success: false, 
        message: "not found"
    })
    }
}
