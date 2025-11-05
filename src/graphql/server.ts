import { ApolloServer } from '@apollo/server';
import { GraphQLSchema } from 'graphql';
import { MyContext } from '../types/context';

export function createApolloServer({ schema, plugins }: { schema: GraphQLSchema; plugins: any[] }) {
  const server = new ApolloServer<MyContext>({
    schema,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    },
    plugins,
  });
  return server;
}
