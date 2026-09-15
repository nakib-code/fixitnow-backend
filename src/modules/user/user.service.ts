import { prisma } from "../../lib/prisma";
import { deleteFromCloudinary, uploadToCloudinary } from "../../utils/cloudinary";

import { UpdateUserProfilePayload } from "./user.interface";


// ==============================
// Update User Profile
// ==============================
const updateUserProfile = async (
  userId: string,
  payload: UpdateUserProfilePayload
) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profileImg: true,
      profileImgPublicId: true,
      address: true,
      city: true,
      postalCode: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};


// ==============================
// Update Profile Image
// ==============================
const updateProfileImage = async (
  userId: string,
  file: { buffer: Buffer }
) => {
  // Current user-এর পুরোনো image public ID বের করা
  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      profileImgPublicId: true,
    },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  // নতুন image আগে Cloudinary-তে upload
  const uploadResult = await uploadToCloudinary(
    file,
    "fixitnow/profile-images"
  );

  // নতুন image successful হলে পুরোনো image delete
  if (currentUser.profileImgPublicId) {
    await deleteFromCloudinary(currentUser.profileImgPublicId);
  }

  // Database-এ নতুন image-এর URL এবং public ID save
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profileImg: uploadResult.secure_url,
      profileImgPublicId: uploadResult.public_id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profileImg: true,
      profileImgPublicId: true,
      address: true,
      city: true,
      postalCode: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};


export const userService = {
  updateUserProfile,
  updateProfileImage,
};