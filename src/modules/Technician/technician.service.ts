import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import {
  TUpdateAvailability,
  TUpdateBookingStatus,
  TUpdateTechnicianProfile,
} from "./technician.interface";

export const getAllTechniciansFromDB = async () => {
  return prisma.user.findMany({
    where: {
      role: "TECHNICIAN",
      status: "ACTIVE",
    },

    select: {
      id: true,

      name: true,

      email: true,

      phone: true,

      profileImg: true,

      role: true,

      status: true,
    },
  });
};

const getMyProfile = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
    include: {
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
  });

  if (!profile) {
    const error: any = new Error("Technician profile not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return profile;
};


const updateProfile = async (
  userId: string,
  payload: TUpdateTechnicianProfile
) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    const error: any = new Error("Technician profile not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return prisma.technicianProfile.update({
    where: {
      userId,
    },
    data: payload,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImg: true,
          role: true,
        },
      },
    },
  });
};

const updateAvailability = async (
  userId: string,
  payload: TUpdateAvailability,
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

  const existingAvailability = await prisma.availability.findFirst({
    where: {
      technicianId: technician.id,
      day: payload.day as any,
      startTime: payload.startTime,
      endTime: payload.endTime,
    },
  });

  if (existingAvailability) {
    return prisma.availability.update({
      where: {
        id: existingAvailability.id,
      },
      data: {
        isAvailable: payload.isAvailable ?? true,
      },
    });
  }

  return prisma.availability.create({
    data: {
      technicianId: technician.id,
      day: payload.day as any,
      startTime: payload.startTime,
      endTime: payload.endTime,
      isAvailable: payload.isAvailable ?? true,
    },
  });
};

const getBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: {
      technicianId: userId,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          provider: true,
          status: true,
          paidAt: true,
        },
      },
      review: {
        select: {
          id: true,
          rating: true,
          comment: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateBookingStatus = async (
  userId: string,
  bookingId: string,
  payload: TUpdateBookingStatus,
) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      technicianId: userId,
    },
  });

  if (!booking) {
    const error: any = new Error("Booking not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: payload.status,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
  });
};

export const TechnicianService = {
  getAllTechniciansFromDB,
  updateProfile,
  updateAvailability,
  getBookings,
  updateBookingStatus,
  getMyProfile
};
