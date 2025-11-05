import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types/context';
import { verifyToken } from '../utils/auth';

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const authorization = context.req.headers.authorization;

  if (!authorization) {
    throw new Error('Not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.userId) {
      throw new Error('Invalid token');
    }

    context.userId = payload.userId;
    return next();
  } catch (err) {
    throw new Error('Not authenticated');
  }
};
