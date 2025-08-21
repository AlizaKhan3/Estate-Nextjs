import User from "../models/user.model";
import { connectionToDb } from "../mongodb/mongoose";

export const createOrUpdateUser = async (
    id,
    first_name,
    last_name,
    image_url,
    email_addresses
) => {
    try {
        await connectionToDb();
        const user = await User.findOneAndUpdate(
            { clerkId: id },
            {
                $set: {
                    firstName: first_name,
                    lastName: last_name,
                    profilePicture: image_url,
                    email: email_addresses[0].email_addresses,
                },
            }, { upsert: true, new: true }
        )
        return user;
    } catch (error) {
        console.log("Error: Could not create or update User", error.message)
    }
}

export const deleteUser = async (id) => {
    try {
        await connectionToDb();
        await User.findOneAndDelete({ clerkId: id });
    } catch (error) {
        console.log("Error: Could not delete User", error.message)
    }
}