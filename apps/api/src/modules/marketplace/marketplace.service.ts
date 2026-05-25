import { z } from 'zod';
import { MarketplaceCategoria, MarketplaceStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { ForbiddenError, NotFoundError } from '../../utils/AppError';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);
const SAFE_URL_REGEX = /^https?:\/\//i;
const WHATSAPP_REGEX = /^\d{10,11}$/;
const ESTADO_REGEX = /^[A-Z]{2}$/;

/* ─── Validation Schemas ─────────────────────────────────────────────────── */

function safeUrlField() {
  return z.string().max(2048).refine((v) => SAFE_URL_REGEX.test(v), {
    message: 'Deve ser uma URL http/https válida',
  });
}

export const createProductSchema = z.object({
  titulo:          z.string().trim().min(3, 'Título: mínimo 3 caracteres').max(100),
  descricao:       z.string().trim().min(10, 'Descrição: mínimo 10 caracteres').max(2000),
  categoria:       z.nativeEnum(MarketplaceCategoria),
  preco:           z.number().positive('Preço deve ser positivo').max(99_999_999),
  precoNegociavel: z.boolean().default(false),
  quantidade:      z.number().positive('Quantidade deve ser positiva').max(999_999),
  unidade:         z.string().trim().min(1).max(20).default('un'),
  cidade:          z.string().trim().max(100).optional(),
  estado:          z.string().trim().toUpperCase().regex(ESTADO_REGEX, 'UF deve ter 2 letras maiúsculas').optional(),
  imageUrl:        safeUrlField().optional().or(z.literal('')).transform((v) => v || undefined),
  imagensExtra:    z.array(safeUrlField()).max(4).default([]),
  externalUrl:     safeUrlField().optional().or(z.literal('')).transform((v) => v || undefined),
  contatoWhatsapp: z.string().trim().regex(WHATSAPP_REGEX, 'WhatsApp: somente dígitos, 10 ou 11').optional().or(z.literal('')).transform((v) => v || undefined),
  contatoEmail:    z.string().trim().email('E-mail inválido').max(200).optional().or(z.literal('')).transform((v) => v || undefined),
  contatoTelefone: z.string().trim().max(20).optional().or(z.literal('')).transform((v) => v || undefined),
});

export const updateProductSchema = createProductSchema.partial();
export const updateStatusSchema   = z.object({ status: z.nativeEnum(MarketplaceStatus) });

export const listFiltersSchema = z.object({
  search:    z.string().trim().max(200).optional(),
  categoria: z.nativeEnum(MarketplaceCategoria).optional(),
  estado:    z.string().trim().toUpperCase().optional(),
  cidade:    z.string().trim().max(100).optional(),
  precoMin:  z.coerce.number().nonnegative().optional(),
  precoMax:  z.coerce.number().positive().optional(),
  orderBy:   z.enum(['recente', 'preco_asc', 'preco_desc', 'visualizacoes']).default('recente'),
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(48).default(24),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ListFiltersDTO   = z.infer<typeof listFiltersSchema>;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const PRODUCT_SELECT = {
  id: true, titulo: true, descricao: true, categoria: true,
  preco: true, precoNegociavel: true, quantidade: true, unidade: true,
  cidade: true, estado: true, imageUrl: true, imagensExtra: true,
  externalUrl: true, contatoWhatsapp: true, contatoEmail: true, contatoTelefone: true,
  destaque: true, visualizacoes: true, status: true, createdAt: true, updatedAt: true,
  produtorId: true,
  produtor: {
    select: {
      id: true, cidade: true, estado: true,
      user: { select: { name: true } },
    },
  },
  _count: { select: { favoritos: true } },
} as const;

async function resolveProdutorId(userId: string) {
  const p = await prisma.produtor.findUnique({ where: { userId }, select: { id: true } });
  if (!p) throw new ForbiddenError('Perfil de produtor não encontrado. Conclua o onboarding primeiro.');
  return p.id;
}

// Returns null instead of throwing — use for read-only "my" endpoints
async function findProdutorId(userId: string): Promise<string | null> {
  const p = await prisma.produtor.findUnique({ where: { userId }, select: { id: true } });
  return p?.id ?? null;
}

async function verifyOwnership(productId: string, produtorId: string, isAdmin: boolean) {
  const product = await prisma.marketplaceProduct.findUnique({
    where:  { id: productId },
    select: { id: true, produtorId: true, status: true },
  });
  if (!product || product.status === 'REMOVIDO') throw new NotFoundError('Produto');
  if (!isAdmin && product.produtorId !== produtorId) throw new ForbiddenError('Sem permissão para modificar este produto');
  return product;
}

function buildOrderBy(ob: ListFiltersDTO['orderBy']) {
  if (ob === 'preco_asc')     return { preco: 'asc'  as const };
  if (ob === 'preco_desc')    return { preco: 'desc' as const };
  if (ob === 'visualizacoes') return { visualizacoes: 'desc' as const };
  return { createdAt: 'desc' as const };
}

/* ─── Service ─────────────────────────────────────────────────────────────── */

export const marketplaceService = {

  async list(filters: ListFiltersDTO, userId?: string) {
    const { search, categoria, estado, cidade, precoMin, precoMax, orderBy, page, limit } = filters;

    const where: any = {
      status: 'ATIVO' as MarketplaceStatus,
      ...(categoria && { categoria }),
      ...(estado    && { estado }),
      ...(cidade    && { cidade: { contains: cidade, mode: 'insensitive' } }),
    };

    if (precoMin !== undefined || precoMax !== undefined) {
      where.preco = {
        ...(precoMin !== undefined && { gte: precoMin }),
        ...(precoMax !== undefined && { lte: precoMax }),
      };
    }

    if (search) {
      where.OR = [
        { titulo:    { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
        { cidade:    { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.marketplaceProduct.count({ where }),
      prisma.marketplaceProduct.findMany({
        where,
        select:  PRODUCT_SELECT,
        orderBy: [{ destaque: 'desc' }, buildOrderBy(orderBy)],
        skip:    (page - 1) * limit,
        take:    limit,
      }),
    ]);

    let favoritoIds = new Set<string>();
    if (userId) {
      const favs = await prisma.marketplaceFavorito.findMany({
        where:  { userId, produtoId: { in: items.map((i) => i.id) } },
        select: { produtoId: true },
      });
      favoritoIds = new Set(favs.map((f) => f.produtoId));
    }

    return {
      data: items.map((p) => ({ ...p, isFavorito: favoritoIds.has(p.id) })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async featured() {
    return prisma.marketplaceProduct.findMany({
      where:   { status: 'ATIVO' },
      select:  PRODUCT_SELECT,
      orderBy: [{ destaque: 'desc' }, { visualizacoes: 'desc' }, { createdAt: 'desc' }],
      take:    8,
    });
  },

  async recent() {
    return prisma.marketplaceProduct.findMany({
      where:   { status: 'ATIVO' },
      select:  PRODUCT_SELECT,
      orderBy: { createdAt: 'desc' },
      take:    12,
    });
  },

  async publicStats() {
    const [totalProdutos, produtoresRaw, estadosRaw] = await Promise.all([
      prisma.marketplaceProduct.count({ where: { status: 'ATIVO' } }),
      prisma.marketplaceProduct.groupBy({ by: ['produtorId'], where: { status: 'ATIVO' } }),
      prisma.marketplaceProduct.findMany({
        where:    { status: 'ATIVO', estado: { not: null } },
        select:   { estado: true },
        distinct: ['estado'],
      }),
    ]);
    return {
      totalProdutos,
      totalProdutores: produtoresRaw.length,
      totalEstados:    estadosRaw.length,
    };
  },

  async categoryCounts() {
    const rows = await prisma.marketplaceProduct.groupBy({
      by:     ['categoria'],
      where:  { status: 'ATIVO' },
      _count: { _all: true },
    });
    return rows.map((r) => ({ categoria: r.categoria, total: r._count._all }));
  },

  async findById(id: string, userId?: string) {
    const product = await prisma.marketplaceProduct.findUnique({ where: { id }, select: PRODUCT_SELECT });
    if (!product || product.status === 'REMOVIDO') throw new NotFoundError('Produto');

    prisma.marketplaceProduct
      .update({ where: { id }, data: { visualizacoes: { increment: 1 } } })
      .catch(() => {});

    let isFavorito = false;
    if (userId) {
      const fav = await prisma.marketplaceFavorito.findUnique({
        where: { produtoId_userId: { produtoId: id, userId } },
      });
      isFavorito = !!fav;
    }

    const relacionados = await prisma.marketplaceProduct.findMany({
      where:   { status: 'ATIVO', categoria: product.categoria, id: { not: id } },
      select:  PRODUCT_SELECT,
      orderBy: { visualizacoes: 'desc' },
      take:    4,
    });

    return { ...product, isFavorito, relacionados };
  },

  async create(userId: string, data: CreateProductDTO) {
    const produtorId = await resolveProdutorId(userId);
    return prisma.marketplaceProduct.create({ data: { produtorId, ...data }, select: PRODUCT_SELECT });
  },

  async update(userId: string, userRole: string, id: string, data: UpdateProductDTO) {
    const isAdmin    = ADMIN_ROLES.has(userRole);
    const produtorId = isAdmin ? '' : await resolveProdutorId(userId);
    await verifyOwnership(id, produtorId, isAdmin);
    return prisma.marketplaceProduct.update({ where: { id }, data, select: PRODUCT_SELECT });
  },

  async updateStatus(userId: string, userRole: string, id: string, status: MarketplaceStatus) {
    const isAdmin    = ADMIN_ROLES.has(userRole);
    const produtorId = isAdmin ? '' : await resolveProdutorId(userId);
    await verifyOwnership(id, produtorId, isAdmin);
    return prisma.marketplaceProduct.update({ where: { id }, data: { status }, select: PRODUCT_SELECT });
  },

  async remove(userId: string, userRole: string, id: string) {
    const isAdmin    = ADMIN_ROLES.has(userRole);
    const produtorId = isAdmin ? '' : await resolveProdutorId(userId);
    await verifyOwnership(id, produtorId, isAdmin);
    await prisma.marketplaceProduct.update({ where: { id }, data: { status: 'REMOVIDO' } });
  },

  async toggleFavorito(userId: string, produtoId: string) {
    const product = await prisma.marketplaceProduct.findUnique({
      where: { id: produtoId }, select: { id: true, status: true },
    });
    if (!product || product.status === 'REMOVIDO') throw new NotFoundError('Produto');

    const existing = await prisma.marketplaceFavorito.findUnique({
      where: { produtoId_userId: { produtoId, userId } },
    });
    if (existing) {
      await prisma.marketplaceFavorito.delete({ where: { produtoId_userId: { produtoId, userId } } });
      return { favorito: false };
    }
    await prisma.marketplaceFavorito.create({ data: { produtoId, userId } });
    return { favorito: true };
  },

  async myFavorites(userId: string) {
    const favs = await prisma.marketplaceFavorito.findMany({
      where:   { userId },
      include: { produto: { select: PRODUCT_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
    return favs
      .filter((f) => f.produto.status !== 'REMOVIDO')
      .map((f) => ({ ...f.produto, isFavorito: true }));
  },

  async myListings(userId: string) {
    const produtorId = await findProdutorId(userId);
    if (!produtorId) return [];
    return prisma.marketplaceProduct.findMany({
      where:   { produtorId, status: { not: 'REMOVIDO' } },
      select:  { ...PRODUCT_SELECT, _count: { select: { favoritos: true, contatos: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async myStats(userId: string) {
    const produtorId = await findProdutorId(userId);
    if (!produtorId) {
      return { ativos: 0, inativos: 0, vendidos: 0, totalViews: 0, totalFavoritos: 0, totalContatos: 0 };
    }
    const products = await prisma.marketplaceProduct.findMany({
      where:  { produtorId, status: { not: 'REMOVIDO' } },
      select: { status: true, visualizacoes: true, _count: { select: { favoritos: true, contatos: true } } },
    });
    return {
      ativos:         products.filter((p) => p.status === 'ATIVO').length,
      inativos:       products.filter((p) => p.status === 'INATIVO').length,
      vendidos:       products.filter((p) => p.status === 'VENDIDO').length,
      totalViews:     products.reduce((s, p) => s + p.visualizacoes, 0),
      totalFavoritos: products.reduce((s, p) => s + p._count.favoritos, 0),
      totalContatos:  products.reduce((s, p) => s + p._count.contatos, 0),
    };
  },

  async trackContact(produtoId: string, tipo: string, userId?: string) {
    const product = await prisma.marketplaceProduct.findUnique({
      where: { id: produtoId }, select: { id: true, status: true },
    });
    if (!product || product.status !== 'ATIVO') return;
    await prisma.marketplaceContato.create({ data: { produtoId, userId, tipo } });
  },
};
