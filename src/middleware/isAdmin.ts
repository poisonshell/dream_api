import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types/context';
import { verifyToken } from '../utils/auth';

export const isAdmin: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const authorization = context.req.headers.authorization;

  if (!authorization) {
    throw new Error('Not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.userId || !payload.isAdmin) {
      throw new Error('Access denied. Admin role required.');
    }

    context.userId = payload.userId;
    return next();
  } catch (err) {
    throw new Error('Not authenticated');
  }
};
