import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      throw new Error('Missing JWT_SECRET in production environment');
    }
  }
  return JWT_SECRET || 'development_only_secret';
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string, isAdmin: boolean = true): string => {
  return jwt.sign({ userId, isAdmin }, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
};
