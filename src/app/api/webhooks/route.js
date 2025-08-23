// import { verifyWebhook } from '@clerk/nextjs/webhooks'
// import { clerkClient } from '@clerk/nextjs/server'
// import { createOrUpdateUser, deleteUser } from '@/lib/actions/user'
// // export async function POST(req: NextRequest) {
// export async function POST(req) {

//     try {
//         const evt = await verifyWebhook(req)
//         const { id } = evt?.data
//         const eventType = evt?.type
//            if (eventType === 'user.created' || eventType === 'user.updated') {
//             const { first_name, last_name, imager_url, email_addresses } = evt?.data;
//             try {
//                 const user = await createOrUpdateUser(
//                     id, first_name, last_name, imager_url, email_addresses
//                 );
//                 if (user && eventType === 'user.created') {
//                     try {
//                         await clerkClient.users.updateUserMetadata(id, {
//                             publicMetadata: {
//                                 userMongoId: user._id
//                             }
//                         })
//                     } catch (error) {
//                         console.log("Error: Could not update metadata:", error.message)
//                     }
//                 }
//             } catch (error) {
//                 console.log("Error: Could not create or update user:", error.message)
//                 return new Response("Error: Could not create or update user", {
//                     status: 400,
//                     success: false
//                 })
//             }
//         }

//         if (eventType === 'user.deleted') {
//             try {
//                 await deleteUser(id);
//             } catch (error) {
//                 console.log("Error: Could not delete user", error)
//                 return new Response("Error: Could not delete user", {
//                     status: 400,
//                     success: false
//                 })
//             }
//         }

//         // console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
//         // console.log('Webhook payload:', evt.data)

//         return new Response('Webhook received', { status: 200 })
//     } catch (err) {
//         console.error('Error verifying webhook:', err)
//         return new Response('Error verifying webhook', { status: 400 })
//     }
// }


// import { headers } from "next/headers";
// import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";
// import { clerkClient } from "@clerk/nextjs/server";
// import { Webhook } from "svix";

// const SIGNING_SECRET = process.env.SIGNING_SECRET;

// if (!SIGNING_SECRET) {
//   throw new Error("Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local");
// }

// export async function POST(req) {
//   const wh = new Webhook(SIGNING_SECRET);

//   const headerPayload = headers();
//   const svix_id = headerPayload.get("svix-id");
//   const svix_timestamp = headerPayload.get("svix-timestamp");
//   const svix_signature = headerPayload.get("svix-signature");

//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return new Response("Error: Missing Svix headers", { status: 400 });
//   }

//   const payload = await req.json();
//   const body = JSON.stringify(payload);

//   let evt;
//   try {
//     evt = wh.verify(body, {
//       "svix-id": svix_id,
//       "svix-timestamp": svix_timestamp,
//       "svix-signature": svix_signature,
//     });
//   } catch (err) {
//     console.error("Error: Could not verify webhook:", err);
//     return new Response("Error: Verification error", { status: 400 });
//   }

//   const { id } = evt?.data;
//   const eventType = evt?.type;

//   try {
//     if (eventType === "user.created" || eventType === "user.updated") {
//       const { first_name, last_name, image_url, email_addresses } = evt?.data;

//       const user = await createOrUpdateUser(
//         id,
//         first_name,
//         last_name,
//         image_url,
//         email_addresses
//       );

//       if (user && eventType === "user.created") {
//         await clerkClient.users.updateUserMetadata(id, {
//           publicMetadata: {
//             userMongoId: user._id, // typo fix: userMongoId not userMogoId
//           },
//         });
//       }
//     }

//     if (eventType === "user.deleted") {
//       await deleteUser(id);
//     }

//     return new Response("Webhook processed successfully", { status: 200 });
//   } catch (error) {
//     console.error("Error handling webhook:", error);
//     return new Response("Error handling webhook", { status: 500 });
//   }
// }







import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";

export async function POST(req) {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET; // use this env name
    if (!SIGNING_SECRET) {
        throw new Error("Missing CLERK_WEBHOOK_SECRET in env");
    }

    const body = await req.text(); // RAW BODY
    const h = headers();
    const svix_id = h.get("svix-id");
    const svix_timestamp = h.get("svix-timestamp");
    const svix_signature = h.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Missing Svix headers", { status: 400 });
    }

    let evt;
    try {
        const wh = new Webhook(SIGNING_SECRET);
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error("❌ Webhook verify failed:", err);
        return new Response("Invalid signature", { status: 400 });
    }

    const { id, first_name, last_name, image_url, email_addresses } = evt.data;
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
        try {
            const user = await createOrUpdateUser(
                id,
                first_name,
                last_name,
                image_url,
                email_addresses
            );

            if (user) {
                await clerkClient.users.updateUser(id, {
                    publicMetadata: {
                        userMongoId: user._id.toString(),
                    },
                });
                console.log("✅ Metadata set:", id, user._id.toString());
            }
        } catch (error) {
            console.error("❌ Metadata update failed:", error);
        }
    }
    if (eventType === "user.deleted") {
        try {
            await deleteUser(id);
        } catch (error) {
            console.error("❌ Delete failed:", error);
        }
    }

    return new Response('Webhook received', { status: 200 });
}