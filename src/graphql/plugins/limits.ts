import { ApolloServerPlugin } from '@apollo/server';
import { GraphQLError } from 'graphql';

type LimitsOptions = {
  maxComplexity: number;
  maxDepth: number;
};

export function createLimitsPlugin({ maxComplexity, maxDepth }: LimitsOptions): ApolloServerPlugin {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          const { request, document, schema } = requestContext;
          if (!document) return;

          // Complexity
          const { getComplexity, simpleEstimator } = await import('graphql-query-complexity');
          const complexity = getComplexity({
            schema,
            operationName: request.operationName,
            query: document,
            variables: request.variables,
            estimators: [simpleEstimator({ defaultComplexity: 1 })],
          });
          if (complexity > maxComplexity) {
            throw new GraphQLError(
              `Query is too complex: ${complexity}. Max allowed: ${maxComplexity}`,
            );
          }

          // Depth
          const { Kind } = await import('graphql');
          let maxSeenDepth = 0;
          function computeDepth(node: any, currentDepth: number) {
            if (!node.selectionSet) {
              if (currentDepth > maxSeenDepth) maxSeenDepth = currentDepth;
              return;
            }
            for (const selection of node.selectionSet.selections) {
              if (selection.kind === Kind.FIELD || selection.kind === Kind.INLINE_FRAGMENT) {
                computeDepth(selection, currentDepth + 1);
              }
            }
          }
          for (const def of document.definitions) {
            if (def.kind === Kind.OPERATION_DEFINITION) {
              computeDepth(def, 0);
            }
          }
          if (maxSeenDepth > maxDepth) {
            throw new GraphQLError(
              `Query is too deep: ${maxSeenDepth}. Max allowed depth: ${maxDepth}`,
            );
          }
        },
      };
    },
  };
}
