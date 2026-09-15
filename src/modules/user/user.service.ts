import { prisma } from "../../lib/prisma";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary";

import { UpdateUserProfilePayload } from "./user.interface";

// ==============================
// Update User Profile
// ==============================

const updateUserProfile = async (
  userId: string,
  payload: UpdateUserProfilePayload,
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
  file: { buffer: Buffer },
) => {
  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      profileImgPublicId: true,
    },
  });

  if (!currentUser) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Upload new image first
  const uploadResult = await uploadToCloudinary(
    file,
    "fixitnow/profile-images",
  );

  // Delete old image
  if (currentUser.profileImgPublicId) {
    await deleteFromCloudinary(
      currentUser.profileImgPublicId,
    );
  }

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

// ==============================
// Get All Users
// ==============================

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profileImg: true,
      address: true,
      city: true,
      postalCode: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
};

// ==============================
// Block User
// ==============================

const blockUser = async (
  userId: string,
  adminId: string,
) => {
  if (userId === adminId) {
    const error: any = new Error(
      "You cannot block yourself",
    );

    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    const error: any = new Error("User not found");

    error.statusCode = 404;
    throw error;
  }

  if (user.role === "ADMIN") {
    const error: any = new Error(
      "Admin user cannot be blocked",
    );

    error.statusCode = 403;
    throw error;
  }

  if (user.status === "BLOCKED") {
    const error: any = new Error(
      "User is already blocked",
    );

    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      status: "BLOCKED",
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profileImg: true,
      address: true,
      city: true,
      postalCode: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// ==============================
// Unblock User
// ==============================

const unblockUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    const error: any = new Error("User not found");

    error.statusCode = 404;
    throw error;
  }

  if (user.role === "ADMIN") {
    const error: any = new Error(
      "Admin user does not need to be unblocked",
    );

    error.statusCode = 400;
    throw error;
  }

  if (user.status === "ACTIVE") {
    const error: any = new Error(
      "User is already active",
    );

    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      status: "ACTIVE",
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profileImg: true,
      address: true,
      city: true,
      postalCode: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// ==============================
// Delete User
// ==============================

const deleteUser = async (
  userId: string,
  adminId: string,
) => {
  // Admin cannot delete himself
  if (userId === adminId) {
    const error: any = new Error(
      "You cannot delete yourself",
    );

    error.statusCode = 400;
    throw error;
  }

  // Find user first
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileImgPublicId: true,
    },
  });

  if (!user) {
    const error: any = new Error("User not found");

    error.statusCode = 404;
    throw error;
  }

  // Protect admin accounts
  if (user.role === "ADMIN") {
    const error: any = new Error(
      "Admin user cannot be deleted",
    );

    error.statusCode = 403;
    throw error;
  }

  // Delete user
  // Related records with onDelete: Cascade
  // will be deleted automatically by PostgreSQL.
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  // Delete profile image from Cloudinary
  if (user.profileImgPublicId) {
    try {
      await deleteFromCloudinary(
        user.profileImgPublicId,
      );
    } catch (error) {
      // User is already deleted from database.
      // Cloudinary failure should not fail the request.
      console.error(
        "Failed to delete profile image from Cloudinary:",
        error,
      );
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const userService = {
  updateUserProfile,
  updateProfileImage,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
};