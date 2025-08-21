import { createOrUpdateUser, deleteUser } from '@/lib/actions/user'
import { clerkClient } from '@clerk/nextjs/server'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

// export async function POST(req: NextRequest) {
export async function POST(req) {

    try {
        const evt = await verifyWebhook(req)

        // Do something with payload
        // For this guide, log payload to console
        const { id } = evt?.data
        const eventType = evt?.type

        if (eventType === 'user.created' || eventType === 'user.updated' === 'user.updated') {
            const { first_name, last_name, imager_url, email_addresses } = evt?.data;
            try {
                const user = await createOrUpdateUser(
                    id, first_name, last_name, imager_url, email_addresses
                );
                if (user && eventType === 'user.created') {
                    try {
                        await clerkClient.users.updateUserMetadata(id, {
                            publicMetadata: {
                                userMongoId: user._id
                            }
                        })
                    } catch (error) {
                        console.log("Error: Could not update metadata:", error.message)
                    }
                }
            } catch (error) {
                console.log("Error: Could not create or update user:", error.message)
                return new Response("Error: Could not create or update user", {
                    status: 400,
                    success: false
                })
            }
        }


        if (eventType === 'user.deleted') {
            try {
                await deleteUser(id);
            } catch (error) {
                console.log("Error: Could not delete user", error)
                return new Response("Error: Could not delete user", {
                    status: 400,
                    success: false
                })
            }
        }
        // console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
        // console.log('Webhook payload:', evt.data)

        return new Response('Webhook received', { status: 200 })
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error verifying webhook', { status: 400 })
    }
}