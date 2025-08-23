// app/api/test-db/route.js
import { connectionToDb } from '@/lib/mongodb/mongoose';

export async function GET() {
  try {
    await connectionToDb();
    return new Response('✅ MongoDB connected successfully', { status: 200 });
  } catch (error) {
    return new Response(`❌ MongoDB connection failed: ${error.message}`, { status: 500 });
  }
}