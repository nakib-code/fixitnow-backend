import { Prisma } from "../../../generated/prisma/browser";
import { prisma } from "../../lib/prisma";
import { deleteFromCloudinary, uploadToCloudinary } from "../../utils/cloudinary";
import { TCreateService } from "./service.interface";
import httpStatus from "http-status";

type UploadFile = {
  buffer: Buffer;
};

const createService = async (
  userId: string,
  payload: TCreateService,
  file?: UploadFile,
) => {
  // Check technician profile
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    const error: any = new Error("Technician profile not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  // Check category
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    const error: any = new Error("Category not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  let image: string | undefined;
  let imagePublicId: string | undefined;

  // Upload service image
  if (file) {
    const uploadedImage = await uploadToCloudinary(
      file,
      "fixitnow/service-images",
    );

    image = uploadedImage.secure_url;
    imagePublicId = uploadedImage.public_id;
  }

  return prisma.service.create({
    data: {
      title: payload.title,
      description: payload.description,
      price: new Prisma.Decimal(payload.price),
      duration: payload.duration,
      technicianId: technician.id,
      categoryId: payload.categoryId,

      ...(image && {
        image,
      }),

      ...(imagePublicId && {
        imagePublicId,
      }),
    },

    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
      },

      technician: {
        select: {
          id: true,
          bio: true,
          experience: true,
          location: true,
          averageRating: true,
          completedJobs: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImg: true,
            },
          },
        },
      },
    },
  });
};

const getServices = async (query: any) => {
  const {
    search,
    category,
    location,
    rating,
    minPrice,
    maxPrice,
  } = query;

  return prisma.service.findMany({
    where: {
      isAvailable: true,

      // Search by title or description
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),

      // Filter by category name
      ...(category && {
        category: {
          name: {
            equals: category,
            mode: "insensitive",
          },
        },
      }),

      // Filter by technician location
      ...(location && {
        technician: {
          location: {
            contains: location,
            mode: "insensitive",
          },
        },
      }),

      // Filter by technician rating
      ...(rating !== undefined && {
        technician: {
          averageRating: {
            gte: Number(rating),
          },
        },
      }),

      // Filter by price range
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && {
            gte: new Prisma.Decimal(minPrice),
          }),

          ...(maxPrice !== undefined && {
            lte: new Prisma.Decimal(maxPrice),
          }),
        },
      }),
    },

    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
      },

      technician: {
        select: {
          id: true,
          bio: true,
          experience: true,
          location: true,
          averageRating: true,
          completedJobs: true,

          user: {
            select: {
              id: true,
              name: true,
              profileImg: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getSingleService = async (serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: {
      id: serviceId,
    },

    include: {
      category: true,

      technician: {
        select: {
          id: true,
          bio: true,
          experience: true,
          location: true,
          averageRating: true,
          completedJobs: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImg: true,
            },
          },
        },
      },
    },
  });

  if (!service) {
    const error: any = new Error("Service not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return service;
};

const getMyServices = async (userId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    const error: any = new Error("Technician profile not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return prisma.service.findMany({
    where: {
      technicianId: technician.id,
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateService = async (
  userId: string,
  serviceId: string,
  payload: Partial<TCreateService>,
  file?: UploadFile,
) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    const error: any = new Error("Technician profile not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      technicianId: technician.id,
    },
  });

  if (!service) {
    const error: any = new Error("Service not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      const error: any = new Error("Category not found");
      error.statusCode = httpStatus.NOT_FOUND;
      throw error;
    }
  }

  let image: string | undefined;
  let imagePublicId: string | undefined;

  // Upload new service image
  if (file) {
    const uploadedImage = await uploadToCloudinary(
      file,
      "fixitnow/service-images",
    );

    image = uploadedImage.secure_url;
    imagePublicId = uploadedImage.public_id;
  }

  const updatedService = await prisma.service.update({
    where: {
      id: serviceId,
    },

    data: {
      ...(payload.title !== undefined && {
        title: payload.title,
      }),

      ...(payload.description !== undefined && {
        description: payload.description,
      }),

      ...(payload.price !== undefined && {
        price: new Prisma.Decimal(payload.price),
      }),

      ...(payload.duration !== undefined && {
        duration: payload.duration,
      }),

      ...(payload.categoryId !== undefined && {
        categoryId: payload.categoryId,
      }),

      ...(payload.isAvailable !== undefined && {
        isAvailable: payload.isAvailable,
      }),

      ...(image && {
        image,
      }),

      ...(imagePublicId && {
        imagePublicId,
      }),
    },

    include: {
      category: true,

      technician: {
        select: {
          id: true,
          bio: true,
          experience: true,
          location: true,
          averageRating: true,
          completedJobs: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImg: true,
            },
          },
        },
      },
    },
  });

  // Delete old image after successful database update
  if (file && service.imagePublicId) {
    try {
      await deleteFromCloudinary(service.imagePublicId);
    } catch (error) {
      console.error(
        "Failed to delete old service image from Cloudinary:",
        error,
      );
    }
  }

  return updatedService;
};

const deleteService = async (
  userId: string,
  serviceId: string,
) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    const error: any = new Error("Technician profile not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      technicianId: technician.id,
    },
  });

  if (!service) {
    const error: any = new Error("Service not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  await prisma.service.delete({
    where: {
      id: serviceId,
    },
  });

  // Delete service image from Cloudinary
  if (service.imagePublicId) {
    try {
      await deleteFromCloudinary(service.imagePublicId);
    } catch (error) {
      console.error(
        "Failed to delete service image from Cloudinary:",
        error,
      );
    }
  }

  return null;
};

export const ServiceService = {
  createService,
  getServices,
  getSingleService,
  getMyServices,
  updateService,
  deleteService,
};