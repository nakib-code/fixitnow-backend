import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";

import { AdminRoutes } from "./modules/Admin/admin.route";
import { AuthRoutes } from "./modules/Auth/auth.route";
import { BookingRoutes } from "./modules/booking/booking.route";
import { CategoryRoutes } from "./modules/category/category.route";
import { PaymentRoutes } from "./modules/payment/payment.route";
import { ReviewRoutes } from "./modules/review/review.route";
import { ServiceRoutes } from "./modules/service/service.route";
import { TechnicianRoutes } from "./modules/Technician/technician.route";

import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { userRouter } from "./modules/user/user.route";

const app: Application = express();


// ===============================
// Middlewares
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ===============================
// CORS Configuration
// ===============================

const allowedOrigins = [
  "http://localhost:3000",

  // Production frontend
  "https://fixitnow-eta-blush.vercel.app",

  // Current Vercel deployment
  "https://fixitnow-1dfy0fdvy-ahmed-nakibs-projects.vercel.app",
];


app.use(
  cors({
    origin: (origin, callback) => {

      // allow server-to-server / Postman requests
      if (!origin) {
        return callback(null, true);
      }


      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }


      return callback(
        new Error("Not allowed by CORS")
      );

    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


// ===============================
// Root Route
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FixItNow API Running",
  });
});


// ===============================
// API Routes
// ===============================

app.use("/api/auth", AuthRoutes);

app.use("/api/categories", CategoryRoutes);

app.use("/api/users", userRouter);

app.use("/api/technician", TechnicianRoutes);

app.use("/api/bookings", BookingRoutes);

app.use("/api/services", ServiceRoutes);

app.use("/api/payments", PaymentRoutes);

app.use("/api/admin", AdminRoutes);

app.use("/api/reviews", ReviewRoutes);


// ===============================
// Error Handler
// ===============================

app.use(notFound);

app.use(globalErrorHandler);


export default app;