// app/api/test-mongo/route.js
import { connectionToDb } from '@/lib/mongodb/mongoose';

export async function GET() {
  try {
    await connectionToDb();
    return Response.json({ 
      success: true, 
      message: 'MongoDB connected successfully on Vercel' 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      message: 'MongoDB connection failed on Vercel' 
    }, { status: 500 });
  }
}