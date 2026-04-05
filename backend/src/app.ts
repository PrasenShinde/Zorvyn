import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rate-limit.middleware.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(apiRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', routes);

  app.use(errorMiddleware);

  return app;
}
