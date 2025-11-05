import type { Express } from 'express';
import type { DataSource } from 'typeorm';

export function registerHealthRoutes(app: Express, dataSource: DataSource) {
  app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/ready', async (_, res) => {
    try {
      if (!dataSource.isInitialized) {
        return res.status(503).json({ status: 'not-initialized' });
      }
      await dataSource.query('SELECT 1');
      return res.json({ status: 'ready' });
    } catch (e) {
      return res.status(503).json({ status: 'db-unavailable' });
    }
  });
}
