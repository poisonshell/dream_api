import { buildSchema } from 'type-graphql';
import { AdminUserResolver } from '../resolvers/AdminUserResolver';
import { ProductResolver } from '../resolvers/ProductResolver';
import { CategoryResolver } from '../resolvers/CategoryResolver';

export async function buildAppSchema() {
  return buildSchema({
    resolvers: [AdminUserResolver, ProductResolver, CategoryResolver],
    validate: true,
  });
}
