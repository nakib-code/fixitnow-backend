import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { AuthService } from "./auth.service";
import { AUTH_MESSAGE } from "./auth.constant";

const isProduction = process.env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: "/",
  maxAge: 1000 * 60 * 60 * 24,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

const register = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: AUTH_MESSAGE.REGISTER_SUCCESS,
      data: result,
    });
  },
);

const login = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    res.cookie(
      "accessToken",
      result.accessToken,
      accessCookieOptions,
    );

    res.cookie(
      "refreshToken",
      result.refreshToken,
      refreshCookieOptions,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: AUTH_MESSAGE.LOGIN_SUCCESS,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  },
);

const refreshToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      const error: any = new Error(
        "Refresh token is required",
      );

      error.statusCode = httpStatus.UNAUTHORIZED;
      throw error;
    }

    const result =
      await AuthService.refreshToken(refreshToken);

    res.cookie(
      "accessToken",
      result.accessToken,
      accessCookieOptions,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
      },
    });
  },
);

const logout = catchAsync(
  async (_req: Request, res: Response) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Logout successful",
      data: null,
    });
  },
);

const getMe = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await AuthService.getMe(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: AUTH_MESSAGE.PROFILE_SUCCESS,
      data: result,
    });
  },
);

export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};