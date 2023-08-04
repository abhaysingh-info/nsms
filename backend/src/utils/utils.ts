import { verify as JWTVerify } from 'jsonwebtoken';

export function verifyJwtToken(token: string) {
  try {
    return JWTVerify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    return null;
  }
}
