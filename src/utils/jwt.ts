import jwt, {
  JwtPayload,
  Secret,
  SignOptions,
} from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

const verifyToken = (
  token: string,
  secret: Secret,
): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtUtils = {
  createToken,
  verifyToken,
};