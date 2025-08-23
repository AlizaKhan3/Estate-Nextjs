// import Listing from '../../../../lib/models/listing.model.js';
// import { connectionToDb } from '../../../../lib/mongodb/mongoose.js';
// import { currentUser } from '@clerk/nextjs/server';
// export const POST = async (req) => {
//   const user = await currentUser();
//   try {
//     await connectionToDb
//     const data = await req.json();
//     if (!user || user.publicMetadata.userMogoId !== data.userMongoId) {
//       return new Response('Unauthorized', {
//         status: 401,
//       });
//     }
//     const newListing = await Listing.create({
//       userRef: user.publicMetadata.userMogoId,
//       name: data.name,
//       description: data.description,
//       address: data.address,
//       regularPrice: data.regularPrice,
//       discountPrice: data.discountPrice,
//       bathrooms: data.bathrooms,
//       bedrooms: data.bedrooms,
//       furnished: data.furnished,
//       parking: data.parking,
//       type: data.type,
//       offer: data.offer,
//       imageUrls: data.imageUrls,
//     });
//     await newListing.save();
//     return new Response(JSON.stringify(newListing), {
//       status: 200,
//     });
//   } catch (error) {
//     console.log('Error creating post:', error);
//     return new Response('Error creating post', {
//       status: 500,
//     });
//   }
// };

import Listing from '@/lib/models/listing.model';
import User from '@/lib/models/user.model';
import { connectionToDb } from '@/lib/mongodb/mongoose';
import { getAuth } from '@clerk/nextjs/server';

export const POST = async (req) => {
  try {
    await connectionToDb();

    // Get the authenticated user from Clerk
    const { userId } = getAuth(req);
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = await req.json();

    // Find the user in MongoDB by their Clerk ID
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return new Response('User not found in database', { status: 404 });
    }

    // Create the listing with the MongoDB user ID
    const newListing = await Listing.create({
      userRef: user._id, // Use the MongoDB _id from the User document
      name: data.name,
      description: data.description,
      address: data.address,
      regularPrice: data.regularPrice,
      discountPrice: data.discountPrice,
      bathrooms: data.bathrooms,
      bedrooms: data.bedrooms,
      furnished: data.furnished,
      parking: data.parking,
      type: data.type,
      offer: data.offer,
      imageUrls: data.imageUrls,
    });

    return new Response(JSON.stringify(newListing), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.log('Error creating listing:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};