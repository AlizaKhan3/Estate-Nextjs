// app/api/get-user-by-clerk-id/route.js
import { connectionToDb } from '@/lib/mongodb/mongoose';
import User from '@/lib/models/user.model';
export async function POST(req) {
  try {
    await connectionToDb();
    const { clerkId } = await req.json();
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ mongoUserId: user._id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}