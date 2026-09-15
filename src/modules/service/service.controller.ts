import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ServiceService } from "./service.service";

const createService = catchAsync(async (req: any, res: Response) => {
  const result = await ServiceService.createService(
    req.user.id,
    req.body,
    req.file
  );

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Service created successfully",
    data: result,
  });
});

const getServices = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.getServices(req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Services retrieved successfully",
    data: result,
  });
});

const getSingleService = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ServiceService.getSingleService(
      req.params.id as string
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Service retrieved successfully",
      data: result,
    });
  }
);

const getMyServices = catchAsync(async (req: any, res: Response) => {
  const result = await ServiceService.getMyServices(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "My services retrieved successfully",
    data: result,
  });
});

const updateService = catchAsync(async (req: any, res: Response) => {
  const result = await ServiceService.updateService(
    req.user.id,
    req.params.id,
    req.body,
    req.file
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service updated successfully",
    data: result,
  });
});

const deleteService = catchAsync(async (req: any, res: Response) => {
  await ServiceService.deleteService(
    req.user.id,
    req.params.id
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service deleted successfully",
    data: null,
  });
});

export const ServiceController = {
  createService,
  getServices,
  getSingleService,
  getMyServices,
  updateService,
  deleteService,
};