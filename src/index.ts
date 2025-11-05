import 'reflect-metadata';
import express from 'express';
import { expressMiddleware } from '@as-integrations/express4';
import helmet from 'helmet';
import cors from 'cors';
import { json } from 'body-parser';
import { config } from 'dotenv';
import { AppDataSource } from './data-source';
import { buildAppSchema } from './graphql/schema';
import { createLimitsPlugin } from './graphql/plugins/limits';
import { createContext } from './graphql/context';
import { createApolloServer } from './graphql/server';
import { registerHealthRoutes } from './routes/health';
import type { Server } from 'http';

config();

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');
    
    // Run migrations in production if they exist
    if (process.env.NODE_ENV === 'production') {
      const pendingMigrations = await AppDataSource.showMigrations();
      if (pendingMigrations) {
        await AppDataSource.runMigrations();
        console.log('Migrations executed successfully');
      } else {
        console.log('No pending migrations');
      }
    } else {
      console.log('Development mode: using synchronize instead of migrations');
    }

    const schema = await buildAppSchema();    const app = express();

    app.use(
      helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'];

    app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
      }),
    );

    const MAX_COMPLEXITY = parseInt(process.env.GRAPHQL_MAX_COMPLEXITY || '250', 10);
    const MAX_DEPTH = parseInt(process.env.GRAPHQL_MAX_DEPTH || '10', 10);
    const limitsPlugin = createLimitsPlugin({ maxComplexity: MAX_COMPLEXITY, maxDepth: MAX_DEPTH });
    const apolloServer = createApolloServer({ schema, plugins: [limitsPlugin] });

    await apolloServer.start();
    console.log('Apollo Server started');

    app.use(
      '/graphql',
      json(),
      expressMiddleware(apolloServer, {
        context: ({ req, res }) => createContext({ req, res }),
      }),
    );

    registerHealthRoutes(app, AppDataSource);

    let server: Server;
    server = app.listen(PORT, () => {
      console.log(`Server ready at http://localhost:${PORT}/graphql`);
      console.log(`Health check at http://localhost:${PORT}/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      try {
        await apolloServer.stop();
      } catch {}
      await new Promise<void>((resolve) => server.close(() => resolve()));
      if (AppDataSource.isInitialized) {
        try {
          await AppDataSource.destroy();
        } catch {}
      }
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

bootstrap();
