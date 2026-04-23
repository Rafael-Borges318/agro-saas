import { CorsOptions } from 'cors';
import { env } from './env';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowed = [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
