import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AdminUser } from './entities/AdminUser';
import { Product } from './entities/Product';
import { Category } from './entities/Category';

config();

const isProd = (process.env.NODE_ENV || 'development') === 'production';
const synchronize = process.env.TYPEORM_SYNC ? process.env.TYPEORM_SYNC === 'true' : !isProd;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'dreamjob_db',
  synchronize,
  logging: process.env.NODE_ENV === 'development',
  entities: [AdminUser, Product, Category],
  migrations: [`${__dirname}/migrations/*.{ts,js}`],
  subscribers: [],
});
