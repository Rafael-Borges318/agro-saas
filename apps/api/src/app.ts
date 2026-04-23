import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors';
import { globalRateLimit } from './middlewares/rate-limit.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { router } from './routes';
import { API_PREFIX } from './utils/constants';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(globalRateLimit);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(API_PREFIX, router);

app.use(errorMiddleware);

export { app };
