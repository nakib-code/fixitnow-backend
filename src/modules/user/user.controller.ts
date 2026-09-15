import { Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";


// ==============================
// Update User Profile
// ==============================
const updateUserProfile = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await userService.updateUserProfile(
    req.user.id,
    req.body
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
  res: Response
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
    req.file
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Profile image updated successfully",
    data: result,
  });
};


export const userController = {
  updateUserProfile,
  updateProfileImage,
};