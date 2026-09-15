import { Request, Response } from "express";
import httpStatus from "http-status";

import { userService } from "./user.service";

// ==============================
// Update User Profile
// ==============================

const updateUserProfile = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await userService.updateUserProfile(
    req.user.id,
    req.body,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
};

// ==============================
// Update Profile Image
// ==============================

const updateProfileImage = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!req.file) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Profile image is required",
    });
  }

  const result = await userService.updateProfileImage(
    req.user.id,
    req.file,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Profile image updated successfully",
    data: result,
  });
};

// ==============================
// Get All Users
// ==============================

const getAllUsers = async (
  _req: Request,
  res: Response,
) => {
  const result = await userService.getAllUsers();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
};

// ==============================
// Block User
// ==============================

const blockUser = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await userService.blockUser(
    req.params.id as string,
    req.user.id,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "User blocked successfully",
    data: result,
  });
};

// ==============================
// Unblock User
// ==============================

const unblockUser = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await userService.unblockUser(
    req.params.id as string,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "User unblocked successfully",
    data: result,
  });
};

// ==============================
// Delete User
// ==============================

const deleteUser = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await userService.deleteUser(
    req.params.id as string,
    req.user.id,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "User deleted successfully",
    data: result,
  });
};

export const userController = {
  updateUserProfile,
  updateProfileImage,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
};