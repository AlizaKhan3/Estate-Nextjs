// import User from "../models/user.model";
// import { connectionToDb } from "../mongodb/mongoose";

// export const createOrUpdateUser = async (
//     id,
//     first_name,
//     last_name,
//     image_url,
//     email_addresses
// ) => {
//     try {
//         console.log("📌 DB connected, creating/updating user:", id);

//         await connectionToDb();
//         console.log("📌 DB connected, creating/updating user:", id);

//         const user = await User.findOneAndUpdate(
//             { clerkId: id },
//             {
//                 $set: {
//                     firstName: first_name,
//                     lastName: last_name,
//                     profilePicture: image_url,
//                     email: email_addresses[0].email_address,
//                 },
//             }, { upsert: true, new: true }
//         )
//         return user;
//     } catch (error) {
//         console.log("Error: Could not create or update User", error.message)
//     }
// }

// export const deleteUser = async (id) => {
//     try {
//         await connectionToDb();
//         await User.findOneAndDelete({ clerkId: id });
//     } catch (error) {
//         console.log("Error: Could not delete User", error.message)
//     }
// }



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
    console.log("🔗 Connecting to MongoDB...");
    await connectionToDb();
    console.log("✅ MongoDB connected");

    const email = email_addresses?.[0]?.email_address || 'no-email';
    
    const userData = {
      clerkId: id,
      firstName: first_name,
      lastName: last_name,
      profilePicture: image_url,
      email: email,
    };

    console.log("💾 Saving user data:", userData);

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      { $set: userData },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("✅ User saved successfully:", user._id);
    return user;

  } catch (error) {
    console.error("❌ Error in createOrUpdateUser:", error.message);
    console.error("❌ Full error:", error);
    throw error; // Re-throw to see the error in webhook
  }
}

export const deleteUser = async (id) => {
  try {
    console.log("🔗 Connecting to MongoDB for deletion...");
    await connectionToDb();
    
    const result = await User.findOneAndDelete({ clerkId: id });
    
    if (!result) {
      console.log("⚠️ User not found for deletion:", id);
      return null;
    }
    
    console.log("✅ User deleted successfully:", id);
    return result;

  } catch (error) {
    console.error("❌ Error in deleteUser:", error.message);
    throw error;
  }
}