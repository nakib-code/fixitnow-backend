import dotenv from "dotenv";
import path from "path";
import { StringValue } from "ms";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export default {
  port: process.env.PORT,

  database_url: process.env.DATABASE_URL,

  app_url: process.env.APP_URL,

  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,

  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,

  jwt_access_expires_in:
    process.env.JWT_ACCESS_EXPIRES_IN as StringValue,

  jwt_refresh_expires_in:
    process.env.JWT_REFRESH_EXPIRES_IN as StringValue,

  stripe_product_price_id:
    process.env.STRIPE_PRODUCT_PRICE_ID!,

  stripe_secret_key:
    process.env.STRIPE_SECRET_KEY!,

  stripe_webhook_secret:
    process.env.STRIPE_WEBHOOK_SECRET!,

  SSLCOMMERZ_STORE_ID:
    process.env.SSLCOMMERZ_STORE_ID!,

  SSLCOMMERZ_STORE_PASSWORD:
    process.env.SSLCOMMERZ_STORE_PASSWORD!,

  SSLCOMMERZ_IS_LIVE:
    process.env.SSLCOMMERZ_IS_LIVE === "true",

  backend_url:
    process.env.BACKEND_URL!,

  clients_url:
    process.env.CLIENT_URL!,
};