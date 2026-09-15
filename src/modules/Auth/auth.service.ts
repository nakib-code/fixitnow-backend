import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";

import config from "../../config";
import { prisma } from "../../lib/prisma";
import { Role } from "../../../generated/prisma/enums";
import { jwtUtils } from "../../utils/jwt";

import { TLoginUser, TRegisterUser } from "./auth.interface";

const register = async (payload: TRegisterUser) => {
  if (
    payload.role !== Role.CUSTOMER &&
    payload.role !== Role.TECHNICIAN
  ) {
    const error: any = new Error(
      "Only CUSTOMER and TECHNICIAN registration is allowed.",
    );

    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const isUserExist = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isUserExist) {
    const error: any = new Error("User already exists");

    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: payload.role,
      },
    });

    if (payload.role === Role.TECHNICIAN) {
      await tx.technicianProfile.create({
        data: {
          userId: user.id,
          bio: "",
          experience: 0,
          location: "Not Set",
        },
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  });

  return result;
};

const login = async (payload: TLoginUser) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    const error: any = new Error("Invalid email or password");

    error.statusCode = httpStatus.UNAUTHORIZED;
    throw error;
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    const error: any = new Error("Invalid email or password");

    error.statusCode = httpStatus.UNAUTHORIZED;
    throw error;
  }

  const accessToken = jwtUtils.createToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const refreshToken = jwtUtils.createToken(
    {
      id: user.id,
    },
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  const { password, ...userData } = user;

  return {
    accessToken,
    refreshToken,
    user: userData,
  };
};

const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success) {
    throw new Error(verifiedRefreshToken.error);
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "BLOCKED") {
    throw new Error("User is blocked!");
  }

  const accessToken = jwtUtils.createToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  return {
    accessToken,
  };
};

const getMe = async (id: string) => {
  return prisma.user.findUnique({
    where: {
      id,
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
};

export const AuthService = {
  register,
  login,
  refreshToken,
  getMe,
};