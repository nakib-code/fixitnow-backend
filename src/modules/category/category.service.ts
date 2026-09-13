import httpStatus from "http-status";
import slugify from "slugify";

import { prisma } from "../../lib/prisma";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary";

type CategoryPayload = {
  name: string;
  description?: string;
};

type UploadFile = {
  buffer: Buffer;
};

const createCategory = async (
  payload: CategoryPayload,
  file?: UploadFile
) => {
  const isCategoryExist = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (isCategoryExist) {
    const error: any = new Error("Category already exists");
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }

  const slug = slugify(payload.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  const isSlugExist = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  if (isSlugExist) {
    const error: any = new Error("Category slug already exists");
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }

  let icon: string | undefined;
  let iconPublicId: string | undefined;

  if (file) {
    const uploadedImage = await uploadToCloudinary(
      file,
      "service-marketplace/categories"
    );

    icon = uploadedImage.secure_url;
    iconPublicId = uploadedImage.public_id;
  }

  return prisma.category.create({
    data: {
      name: payload.name,
      slug,
      icon,
      iconPublicId,
      description: payload.description,
    },
  });
};

const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    const error: any = new Error("Category not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return category;
};

const updateCategory = async (
  id: string,
  payload: CategoryPayload,
  file?: UploadFile
) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    const error: any = new Error("Category not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const slug = slugify(payload.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  const isCategoryExist = await prisma.category.findFirst({
    where: {
      OR: [
        {
          name: payload.name,
        },
        {
          slug,
        },
      ],
      NOT: {
        id,
      },
    },
  });

  if (isCategoryExist) {
    const error: any = new Error("Category already exists");
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }

  let icon = category.icon;
  let iconPublicId = category.iconPublicId;

  if (file) {
    // Upload new image first
    const uploadedImage = await uploadToCloudinary(
      file,
      "service-marketplace/categories"
    );

    icon = uploadedImage.secure_url;
    iconPublicId = uploadedImage.public_id;

    // Delete old image from Cloudinary
    if (category.iconPublicId) {
      try {
        await deleteFromCloudinary(category.iconPublicId);
      } catch (error) {
        console.error("Failed to delete old category icon:", error);
      }
    }
  }

  return prisma.category.update({
    where: {
      id,
    },
    data: {
      name: payload.name,
      slug,
      icon,
      iconPublicId,
      description: payload.description,
    },
  });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    const error: any = new Error("Category not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const service = await prisma.service.findFirst({
    where: {
      categoryId: id,
    },
  });

  if (service) {
    const error: any = new Error(
      "Cannot delete category because services exist under this category."
    );

    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  // Delete image from Cloudinary
  if (category.iconPublicId) {
    try {
      await deleteFromCloudinary(category.iconPublicId);
    } catch (error) {
      console.error("Failed to delete category icon:", error);
    }
  }

  // Delete category from database
  return prisma.category.delete({
    where: {
      id,
    },
  });
};

export const CategoryService = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};