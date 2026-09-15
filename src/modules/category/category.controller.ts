import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryService } from "./category.service";

const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CategoryService.createCategory(
      req.body,
      req.file
    );

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Category created successfully",
      data: result,
    });
  }
);

const getCategories = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await CategoryService.getCategories();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Categories retrieved successfully",
      data: result,
    });
  }
);

const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CategoryService.updateCategory(
      req.params.id as string,
      req.body,
      req.file
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Category updated successfully",
      data: result,
    });
  }
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    await CategoryService.deleteCategory(
      req.params.id as string
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Category deleted successfully",
      data: null,
    });
  }
);

export const CategoryController = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};