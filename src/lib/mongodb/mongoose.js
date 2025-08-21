import mongoose from "mongoose";

// --------------Connection with  Mongodb db Compass---------
const MONGODB_URI = process.env.MONGODB_URI
const mongoose = { conn: null, promise: null }

let cached = global.mongoose
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}
export const connectionToDb = async () => {
    if(cached.conn) {
        return cached.conn
    }
    if(!cached.promise){
        const opts = {
            bufferCommands : false
        }
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongo) => {
            return mongo
        })
        try {
            cached.conn = await cached.promise
        } catch (error) {
            cached.promise = null
            throw error         
        }
    }
    return cached.conn
}





// // --------------Connection with Mongodb db driver---------

// let initialized = false;

// export const connectToDB = async () => {
//     mongoose.set('strictQuery', true);
//     if(initialized) {
//         console.log("Mongodb already connected");
//         return; 
//     }
//     try {
//         await mongoose.connect(MONGODB_URI, {
//             dbName: "next-estate",
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         initialized = true;
//         console.log("MongoDB connected")
//     } catch (error) {
//         console.log("MongoDB connection error", error)
//     }
// }