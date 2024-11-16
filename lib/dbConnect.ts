import mongoose from "mongoose";

const connection: {isConnected?: number} = {}

const dbConnect = async () => {
    if(connection.isConnected)
        return

    const db = await mongoose.connect("mongodb://127.0.0.1:27017/LeSikum")
}

export default dbConnect