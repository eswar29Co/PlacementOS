import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types';

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: config.jwt.expiresIn,
  } as any);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret as string, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as any);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret as string) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.refreshSecret as string) as JWTPayload;
};
