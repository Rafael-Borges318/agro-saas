import { Router } from 'express';
import { marketplaceController } from './marketplace.controller';
import { authenticate, optionalAuthenticate, requireRole } from '../../middlewares/auth.middleware';

export const marketplaceRouter = Router();

// ── Admin routes (before param routes) ───────────────────────────────────────
marketplaceRouter.post('/crawler/run', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), marketplaceController.runCrawler);

// ── Public static routes (before param routes) ───────────────────────────────
marketplaceRouter.get('/featured',   marketplaceController.featured);
marketplaceRouter.get('/recent',     marketplaceController.recent);
marketplaceRouter.get('/stats',      marketplaceController.publicStats);
marketplaceRouter.get('/categorias', marketplaceController.categoryCounts);

// ── Authenticated "my" routes ─────────────────────────────────────────────────
marketplaceRouter.get('/meus',        authenticate, marketplaceController.myListings);
marketplaceRouter.get('/meus/stats',  authenticate, marketplaceController.myStats);
marketplaceRouter.get('/favoritos',   authenticate, marketplaceController.myFavorites);

// ── Core list + create ────────────────────────────────────────────────────────
marketplaceRouter.get('/',  optionalAuthenticate, marketplaceController.list);
marketplaceRouter.post('/', authenticate,         marketplaceController.create);

// ── Param routes (after all static routes) ───────────────────────────────────
marketplaceRouter.get('/:id',          optionalAuthenticate, marketplaceController.findById);
marketplaceRouter.patch('/:id',        authenticate,         marketplaceController.update);
marketplaceRouter.patch('/:id/status', authenticate,         marketplaceController.updateStatus);
marketplaceRouter.delete('/:id',       authenticate,         marketplaceController.remove);
marketplaceRouter.post('/:id/favorito',authenticate,         marketplaceController.toggleFavorito);
marketplaceRouter.post('/:id/contato', optionalAuthenticate, marketplaceController.trackContact);
