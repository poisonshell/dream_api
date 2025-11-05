import { Request, Response } from 'express';
import DataLoader from 'dataloader';
import { AdminUser } from '../entities/AdminUser';
import { Category } from '../entities/Category';

export interface MyContext {
  req: Request;
  res: Response;
  userId?: string;
  adminUser?: AdminUser;
  loaders?: {
    adminUserById: DataLoader<string, AdminUser | null>;
    categoryById: DataLoader<string, Category | null>;
  };
}
