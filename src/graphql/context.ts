import { MyContext } from '../types/context';
import { verifyToken } from '../utils/auth';
import { createAdminUserLoader } from '../loaders/AdminUserLoader';
import { createCategoryLoader } from '../loaders/CategoryLoader';

export async function createContext({ req, res }: { req: any; res: any }): Promise<MyContext> {
  const context: MyContext = {
    req,
    res,
    loaders: {
      adminUserById: createAdminUserLoader(),
      categoryById: createCategoryLoader(),
    },
  };

  const authorization = req.headers?.authorization;
  if (authorization) {
    try {
      const token = authorization.split(' ')[1];
      const payload = verifyToken(token);
      if (payload && payload.userId) {
        context.userId = payload.userId;
      }
    } catch (err) {
      // context remains unauthenticated
    }
  }

  return context;
}
