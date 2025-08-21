// import { createOrUpdateUser, deleteUser } from '@/lib/actions/user'
// import { clerkClient } from '@clerk/nextjs/server'
// import { verifyWebhook } from '@clerk/nextjs/webhooks'
// import { NextRequest } from 'next/server'

// // export async function POST(req: NextRequest) {
// export async function POST(req) {

//     try {
//         const evt = await verifyWebhook(req)

//         // Do something with payload
//         // For this guide, log payload to console
//         const { id } = evt?.data
//         const eventType = evt?.type

//         if (eventType === 'user.created' || eventType === 'user.updated') {
//             const { first_name, last_name, image_url, email_addresses } = evt?.data;
//             try {
//                 const user = await createOrUpdateUser(
//                     id, first_name, last_name, image_url, email_addresses
//                 );
//                 // if (user && eventType === 'user.created') {
//                 //     try {
//                 //         await clerkClient.users.updateUser(id, {
//                 //             publicMetadata: {
//                 //                 userMongoId: user._id.toString()
//                 //             }
//                 //         })
//                 //         console.log("ye rahi id ",user._id);
//                 //     } catch (error) {
//                 //         console.log("Error: Could not update metadata:", error.message)
//                 //     }
//                 // }


//                 // if (user && eventType === 'user.created') {
//                 //     try {
//                 //         console.log("➡️ Updating Clerk metadata for user:", id, "with MongoId:", user._id.toString())

//                 //         await clerkClient.users.updateUser(id, {
//                 //             publicMetadata: {
//                 //                 userMongoId: user._id.toString()
//                 //             }
//                 //         })

//                 //         console.log("✅ Metadata updated successfully")
//                 //     } catch (error) {
//                 //         console.log("❌ Error: Could not update metadata:", error.message)
//                 //     }
//                 // }
//                 if (user && (eventType === 'user.created' || eventType === 'user.updated')) {
//                     try {
//                         console.log("➡️ Updating Clerk metadata for user:", id, "with MongoId:", user._id.toString())

//                         await clerkClient.users.updateUser(id, {
//                             publicMetadata: {
//                                 userMongoId: user._id.toString()
//                             }
//                         })

//                         console.log("✅ Metadata updated successfully")
//                     } catch (error) {
//                         console.log("❌ Error: Could not update metadata:", error.message)
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



import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req) {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;

    if (!SIGNING_SECRET) {
        throw new Error(
            'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local'
        );
    }

    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET);

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing Svix headers', {
            status: 400,
        });
    }

    // Get body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    let evt;

    // Verify payload with headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err) {
        console.error('Error: Could not verify webhook:', err);
        return new Response('Error: Verification error', {
            status: 400,
        });
    }

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt?.data;
    const eventType = evt?.type;

    // if (eventType === 'user.created' || eventType === 'user.updated') {
    //     const { first_name, last_name, image_url, email_addresses } = evt?.data;
    //     try {
    //         const user = await createOrUpdateUser(
    //             id,
    //             first_name,
    //             last_name,
    //             image_url,
    //             email_addresses
    //         );
    //         if (user && (eventType === 'user.created' || eventType === 'user.updated')) {
    //             try {
    //                 await clerkClient.users.updateUser(id, {
    //                     publicMetadata: {
    //                         userMongoId: user._id.toString(),
    //                     },
    //                 });
    //             } catch (error) {
    //                 console.log('Error: Could not update user metadata:', error);
    //             }
    //         }
    //     } catch (error) {
    //         console.log('Error: Could not create or update user:', error);
    //         return new Response('Error: Could not create or update user', {
    //             status: 400,
    //         });
    //     }
    // }

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { first_name, last_name, image_url, email_addresses } = evt?.data;
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
                console.log("✅ Metadata set for Clerk user:", id, "→", user._id.toString());
            }
        } catch (error) {
            console.log("❌ Error in user create/update:", error);
        }
    }

    if (eventType === 'user.deleted') {
        try {
            await deleteUser(id);
        } catch (error) {
            console.log('Error: Could not delete user:', error);
            return new Response('Error: Could not delete user', {
                status: 400,
            });
        }
    }

    return new Response('Webhook received', { status: 200 });
}