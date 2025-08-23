// import { Webhook } from 'svix';
// import { headers } from 'next/headers';
// import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';
// import { clerkClient } from '@clerk/nextjs/server';

// export async function POST(req) {
//     // Add this at the beginning of your POST function
//     console.log('📨 Webhook received:', {
//         hasSigningSecret: !!SIGNING_SECRET,
//         hasHeaders: !!svix_id && !!svix_timestamp && !!svix_signature,
//         eventType: eventType,
//         userId: id
//     });
//     const SIGNING_SECRET = process.env.SIGNING_SECRET;

//     if (!SIGNING_SECRET) {
//         throw new Error(
//             'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local'
//         );
//     }

//     // Create new Svix instance with secret
//     const wh = new Webhook(SIGNING_SECRET);

//     // Get headers
//     const headerPayload = await headers();
//     const svix_id = headerPayload.get('svix-id');
//     const svix_timestamp = headerPayload.get('svix-timestamp');
//     const svix_signature = headerPayload.get('svix-signature');

//     // If there are no headers, error out
//     if (!svix_id || !svix_timestamp || !svix_signature) {
//         return new Response('Error: Missing Svix headers', {
//             status: 400,
//         });
//     }

//     // Get body
//     const payload = await req.json();
//     const body = JSON.stringify(payload);

//     let evt;

//     // Verify payload with headers
//     try {
//         evt = wh.verify(body, {
//             'svix-id': svix_id,
//             'svix-timestamp': svix_timestamp,
//             'svix-signature': svix_signature,
//         });
//         console.log('🎯 Webhook verified successfully');
//         console.log('📋 Event type:', eventType);
//         console.log('👤 User ID:', id);
//         console.log('📧 Email addresses:', email_addresses);
//     } catch (err) {
//         console.error('Error: Could not verify webhook:', err);
//         return new Response('Error: Verification error', {
//             status: 400,
//         });
//     }

//     // Do something with payload
//     // For this guide, log payload to console
//     const { id } = evt?.data;
//     const eventType = evt?.type;

//     // if (eventType === 'user.created' || eventType === 'user.updated') {
//     //     const { first_name, last_name, image_url, email_addresses } = evt?.data;
//     //     try {
//     //         const user = await createOrUpdateUser(
//     //             id,
//     //             first_name,
//     //             last_name,
//     //             image_url,
//     //             email_addresses
//     //         );
//     //         if (user && eventType === 'user.created') {
//     //             try {
//     //                 await clerkClient.users.updateUserMetadata(id, {
//     //                     publicMetadata: {
//     //                         userMongoId: user._id,
//     //                     },
//     //                 });
//     //             } catch (error) {
//     //                 console.log('Error: Could not update user metadata:', error);
//     //             }
//     //         }
//     //     } catch (error) {
//     //         console.log('Error: Could not create or update user:', error);
//     //         return new Response('Error: Could not create or update user', {
//     //             status: 400,
//     //         });
//     //     }
//     // }



//     // In your webhook POST function
//     if (eventType === 'user.created' || eventType === 'user.updated') {
//         const { first_name, last_name, image_url, email_addresses } = evt?.data;
//         try {
//             const user = await createOrUpdateUser(
//                 id,
//                 first_name,
//                 last_name,
//                 image_url,
//                 email_addresses
//             );

//             console.log('✅ User processed successfully:', user?._id);

//             if (user && eventType === 'user.created') {
//                 try {
//                     await clerkClient.users.updateUserMetadata(id, {
//                         publicMetadata: {
//                             userMongoId: user._id.toString(), // Fixed typo: userMogoId → userMongoId
//                         },
//                     });
//                     console.log('✅ User metadata updated in Clerk');
//                 } catch (error) {
//                     console.log('❌ Error updating user metadata:', error);
//                 }
//             }
//         } catch (error) {
//             console.log('❌ Error in user creation/update:', error);
//             return new Response(`Error: ${error.message}`, {
//                 status: 400,
//             });
//         }
//     }
//     if (eventType === 'user.deleted') {
//         try {
//             await deleteUser(id);
//         } catch (error) {
//             console.log('Error: Could not delete user:', error);
//             return new Response('Error: Could not delete user', {
//                 status: 400,
//             });
//         }
//     }

//     return new Response('Webhook received', { status: 200 });
// }


import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req) {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;

    // Log at the beginning
    console.log('📨 Webhook received at:', new Date().toISOString());
    console.log('🔐 Signing secret exists:', !!SIGNING_SECRET);

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

    // Log headers
    console.log('📋 Headers received:', {
        svix_id: !!svix_id,
        svix_timestamp: !!svix_timestamp,
        svix_signature: !!svix_signature
    });

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.log('❌ Missing Svix headers');
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
        console.log('✅ Webhook verified successfully');
    } catch (err) {
        console.error('❌ Error: Could not verify webhook:', err);
        return new Response('Error: Verification error', {
            status: 400,
        });
    }

    // Extract data from verified event
    const { id } = evt?.data;
    const eventType = evt?.type;

    // Log event details
    console.log('🎯 Event details:', {
        eventType: eventType,
        userId: id,
        data: evt?.data
    });

    // Handle user events
    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { first_name, last_name, image_url, email_addresses } = evt?.data;
        
        console.log('👤 Processing user:', {
            first_name,
            last_name,
            email: email_addresses?.[0]?.email_address,
            image_url
        });

        try {
            const user = await createOrUpdateUser(
                id,
                first_name,
                last_name,
                image_url,
                email_addresses
            );

            console.log('✅ User processed successfully in MongoDB:', user?._id);

            if (user && eventType === 'user.created') {
                try {
                    await clerkClient.users.updateUserMetadata(id, {
                        publicMetadata: {
                            userMongoId: user._id.toString(),
                        },
                    });
                    console.log('✅ User metadata updated in Clerk');
                } catch (error) {
                    console.log('❌ Error updating user metadata:', error);
                }
            }
            
            return new Response('User created/updated successfully', { status: 200 });
            
        } catch (error) {
            console.log('❌ Error in user creation/update:', error);
            return new Response(`Error: ${error.message}`, {
                status: 400,
            });
        }
    }

    if (eventType === 'user.deleted') {
        console.log('🗑️ Deleting user:', id);
        try {
            await deleteUser(id);
            console.log('✅ User deleted successfully');
            return new Response('User deleted successfully', { status: 200 });
        } catch (error) {
            console.log('❌ Error: Could not delete user:', error);
            return new Response('Error: Could not delete user', {
                status: 400,
            });
        }
    }

    // If event type is not handled
    console.log('ℹ️ Unhandled event type:', eventType);
    return new Response('Webhook received (unhandled event type)', { status: 200 });
}