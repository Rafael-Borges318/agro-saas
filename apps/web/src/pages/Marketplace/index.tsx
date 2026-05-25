import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { marketplaceService } from '../../services/marketplace.service';
import { useAuthStore } from '../../store/auth.store';
import type {
  CreateMarketplaceData,
  MarketplaceCategoryCount,
  MarketplaceCategoria,
  MarketplaceFilters,
  MarketplaceMyStats,
  MarketplaceProduct,
  MarketplacePublicStats,
  UpdateMarketplaceData,
} from '../../types';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const CATEGORIA_LABELS: Record<MarketplaceCategoria, string> = {
  INSUMOS:      'Insumos',
  MAQUINARIOS:  'Maquinários',
  PECUARIA:     'Pecuária',
  GRAOS:        'Grãos',
  FERTILIZANTES:'Fertilizantes',
  FERRAMENTAS:  'Ferramentas',
  SERVICOS:     'Serviços',
  SEMENTES:     'Sementes',
  RACAO:        'Ração',
  IRRIGACAO:    'Irrigação',
  HORTIFRUTI:   'Hortifruti',
  EQUIPAMENTOS: 'Equipamentos',
};

const CATEGORIA_EMOJI: Record<MarketplaceCategoria, string> = {
  INSUMOS:      '🧪',
  MAQUINARIOS:  '🚜',
  PECUARIA:     '🐄',
  GRAOS:        '🌾',
  FERTILIZANTES:'🌱',
  FERRAMENTAS:  '🔧',
  SERVICOS:     '⚙️',
  SEMENTES:     '🌿',
  RACAO:        '🥬',
  IRRIGACAO:    '💧',
  HORTIFRUTI:   '🍅',
  EQUIPAMENTOS: '🏗️',
};

const STATUS_LABELS: Record<string, string> = {
  ATIVO:   'Ativo',
  INATIVO: 'Inativo',
  VENDIDO: 'Vendido',
  REMOVIDO:'Removido',
};

const STATUS_COLORS: Record<string, string> = {
  ATIVO:   'bg-green-100 text-green-800',
  INATIVO: 'bg-yellow-100 text-yellow-800',
  VENDIDO: 'bg-blue-100 text-blue-800',
  REMOVIDO:'bg-red-100 text-red-800',
};

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const ALL_CATEGORIAS = Object.keys(CATEGORIA_LABELS) as MarketplaceCategoria[];

type View = 'home' | 'listing' | 'detail' | 'dashboard';

function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'hoje';
  if (d === 1) return 'ontem';
  if (d < 30) return `${d} dias atrás`;
  const m = Math.floor(d / 30);
  return m === 1 ? '1 mês atrás' : `${m} meses atrás`;
}

/* ─── Product Card ───────────────────────────────────────────────────────── */

function ProductCard({
  product,
  onSelect,
  onToggleFav,
}: {
  product: MarketplaceProduct;
  onSelect: (p: MarketplaceProduct) => void;
  onToggleFav?: (id: string) => void;
}) {
  return (
    <div
      className="card cursor-pointer hover:shadow-md transition-shadow flex flex-col"
      onClick={() => onSelect(product)}
    >
      <div className="relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.titulo}
            className="w-full h-40 object-cover rounded-t-lg"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-40 bg-blue-50 rounded-t-lg flex items-center justify-center text-4xl">
            {CATEGORIA_EMOJI[product.categoria]}
          </div>
        )}
        {product.destaque && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
            ⭐ Destaque
          </span>
        )}
        {onToggleFav && (
          <button
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow hover:bg-red-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); onToggleFav(product.id); }}
          >
            <span className={product.isFavorito ? 'text-red-500' : 'text-gray-400'}>
              {product.isFavorito ? '❤️' : '🤍'}
            </span>
          </button>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {CATEGORIA_LABELS[product.categoria]}
          </span>
          {product.precoNegociavel && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              Negociável
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">
          {product.titulo}
        </h3>

        <div className="mt-2">
          <p className="text-lg font-bold text-blue-700">{fmtBRL(product.preco)}</p>
          <p className="text-xs text-gray-500">
            {product.quantidade} {product.unidade}
            {(product.cidade || product.estado) && (
              <> · {[product.cidade, product.estado].filter(Boolean).join(', ')}</>
            )}
          </p>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">{product.produtor.user.name}</p>
          <p className="text-xs text-gray-400">👁 {product.visualizacoes}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Home View ──────────────────────────────────────────────────────────── */

function HomeView({
  onNavigate,
  onSelectProduct,
  isLoggedIn,
}: {
  onNavigate: (v: View, filters?: MarketplaceFilters) => void;
  onSelectProduct: (p: MarketplaceProduct) => void;
  isLoggedIn: boolean;
}) {
  const [stats, setStats]       = useState<MarketplacePublicStats | null>(null);
  const [featured, setFeatured] = useState<MarketplaceProduct[]>([]);
  const [recent, setRecent]     = useState<MarketplaceProduct[]>([]);
  const [catCounts, setCatCounts] = useState<MarketplaceCategoryCount[]>([]);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    Promise.all([
      marketplaceService.publicStats(),
      marketplaceService.featured(),
      marketplaceService.recent(),
      marketplaceService.categoryCounts(),
    ]).then(([s, f, r, c]) => {
      setStats(s);
      setFeatured(f);
      setRecent(r);
      setCatCounts(c);
    }).catch(() => {});
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) onNavigate('listing', { search: search.trim() });
  };

  const topCats = [...catCounts].sort((a, b) => b.total - a.total).slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold mb-2">Marketplace Agrícola</h2>
          <p className="text-blue-200 mb-6">
            Conecte-se com produtores de todo o Brasil. Compre e venda insumos, animais, maquinários e muito mais.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Buscar produtos, insumos, animais..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Buscar
            </button>
          </form>
          {isLoggedIn && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="mt-4 text-blue-200 hover:text-white text-sm underline"
            >
              Meus anúncios →
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Produtos', value: stats.totalProdutos, icon: '📦' },
            { label: 'Produtores', value: stats.totalProdutores, icon: '👩‍🌾' },
            { label: 'Estados', value: stats.totalEstados, icon: '🗺️' },
          ].map((s) => (
            <div key={s.label} className="card text-center py-5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-blue-700">{s.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      {topCats.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg">Categorias</h3>
            <button
              onClick={() => onNavigate('listing')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todos →
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {topCats.map((c) => (
              <button
                key={c.categoria}
                onClick={() => onNavigate('listing', { categoria: c.categoria })}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
              >
                <span className="text-2xl">{CATEGORIA_EMOJI[c.categoria]}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 text-center leading-tight">
                  {CATEGORIA_LABELS[c.categoria]}
                </span>
                <span className="text-xs text-gray-400">{c.total}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg">⭐ Em destaque</h3>
            <button
              onClick={() => onNavigate('listing', { orderBy: 'visualizacoes' })}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver mais →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg">🕐 Recém adicionados</h3>
            <button
              onClick={() => onNavigate('listing', { orderBy: 'recente' })}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todos →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recent.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Listing View ───────────────────────────────────────────────────────── */

function ListingView({
  initialFilters,
  onSelectProduct,
  onBack,
}: {
  initialFilters?: MarketplaceFilters;
  onSelectProduct: (p: MarketplaceProduct) => void;
  onBack: () => void;
}) {
  const [filters, setFilters]   = useState<MarketplaceFilters>({ orderBy: 'recente', page: 1, limit: 24, ...initialFilters });
  const [search, setSearch]     = useState(initialFilters?.search ?? '');
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, limit: 24, totalPages: 0 });
  const [loading, setLoading]   = useState(false);
  const [favs, setFavs]         = useState<Set<string>>(new Set());
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (f: MarketplaceFilters) => {
    setLoading(true);
    try {
      const result = await marketplaceService.list(f);
      setProducts(result.data);
      setMeta(result.meta);
      const newFavs = new Set(result.data.filter((p) => p.isFavorito).map((p) => p.id));
      setFavs(newFavs);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filters); }, [filters, load]);

  const setFilter = (patch: Partial<MarketplaceFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setFilter({ search: val || undefined }), 400);
  };

  const handleToggleFav = async (id: string) => {
    try {
      const res = await marketplaceService.toggleFavorito(id);
      setFavs((prev) => {
        const next = new Set(prev);
        if (res.favorito) next.add(id); else next.delete(id);
        return next;
      });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isFavorito: res.favorito } : p));
    } catch { /* not logged in */ }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Início
        </button>
        <h2 className="font-bold text-gray-900 text-lg">Todos os produtos</h2>
        <span className="text-sm text-gray-500">({meta.total.toLocaleString()} resultados)</span>
      </div>

      <div className="flex gap-4">
        {/* Sidebar filters */}
        <div className="w-56 flex-shrink-0 space-y-4">
          <div className="card space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Filtros</h4>

            <div>
              <label className="text-xs text-gray-500 font-medium">Busca</label>
              <input
                className="input mt-1 text-sm"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Categoria</label>
              <select
                className="input mt-1 text-sm"
                value={filters.categoria ?? ''}
                onChange={(e) => setFilter({ categoria: (e.target.value as MarketplaceCategoria) || undefined })}
              >
                <option value="">Todas</option>
                {ALL_CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Estado</label>
              <select
                className="input mt-1 text-sm"
                value={filters.estado ?? ''}
                onChange={(e) => setFilter({ estado: e.target.value || undefined })}
              >
                <option value="">Todos</option>
                {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Preço mínimo (R$)</label>
              <input
                type="number"
                className="input mt-1 text-sm"
                placeholder="0"
                value={filters.precoMin ?? ''}
                onChange={(e) => setFilter({ precoMin: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Preço máximo (R$)</label>
              <input
                type="number"
                className="input mt-1 text-sm"
                placeholder="Sem limite"
                value={filters.precoMax ?? ''}
                onChange={(e) => setFilter({ precoMax: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <button
              className="btn-secondary w-full text-sm"
              onClick={() => {
                setSearch('');
                setFilters({ orderBy: 'recente', page: 1, limit: 24 });
              }}
            >
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Sort bar */}
          <div className="flex items-center justify-between">
            <select
              className="input w-44 text-sm"
              value={filters.orderBy}
              onChange={(e) => setFilter({ orderBy: e.target.value as MarketplaceFilters['orderBy'] })}
            >
              <option value="recente">Mais recentes</option>
              <option value="preco_asc">Menor preço</option>
              <option value="preco_desc">Maior preço</option>
              <option value="visualizacoes">Mais vistos</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-64 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold text-gray-700">Nenhum produto encontrado</p>
              <p className="text-sm text-gray-400 mt-1">Tente outros filtros ou termos de busca</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{ ...p, isFavorito: favs.has(p.id) }}
                    onSelect={onSelectProduct}
                    onToggleFav={handleToggleFav}
                  />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    className="btn-secondary text-sm px-3 py-1.5"
                    disabled={meta.page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page! - 1 }))}
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {meta.page} de {meta.totalPages}
                  </span>
                  <button
                    className="btn-secondary text-sm px-3 py-1.5"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page! + 1 }))}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Detail View ────────────────────────────────────────────────────────── */

function DetailView({
  productId,
  onBack,
  onSelectProduct,
}: {
  productId: string;
  onBack: () => void;
  onSelectProduct: (p: MarketplaceProduct) => void;
}) {
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    marketplaceService.findById(productId).then((p) => {
      setProduct(p);
      setActiveImage(0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [productId]);

  const handleToggleFav = async () => {
    if (!product) return;
    try {
      const res = await marketplaceService.toggleFavorito(product.id);
      setProduct((p) => p ? { ...p, isFavorito: res.favorito } : p);
    } catch { /* not logged in */ }
  };

  const handleContact = (tipo: string) => {
    if (!product) return;
    marketplaceService.trackContact(product.id, tipo).catch(() => {});
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded" />
        <div className="h-72 bg-gray-200 rounded-xl" />
        <div className="h-32 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="card text-center py-16">
        <p className="text-4xl mb-3">❌</p>
        <p className="font-semibold text-gray-700">Produto não encontrado</p>
        <button onClick={onBack} className="btn-secondary mt-4">← Voltar</button>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...product.imagensExtra].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800">← Voltar</button>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500">{CATEGORIA_LABELS[product.categoria]}</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium truncate max-w-xs">{product.titulo}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: images + description */}
        <div className="lg:col-span-2 space-y-4">
          {/* Image gallery */}
          <div className="rounded-xl overflow-hidden bg-gray-100">
            {allImages.length > 0 ? (
              <>
                <img
                  src={allImages[activeImage]}
                  alt={product.titulo}
                  className="w-full h-80 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                />
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {allImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className={`w-16 h-16 object-cover rounded cursor-pointer border-2 transition-colors ${i === activeImage ? 'border-blue-600' : 'border-transparent'}`}
                        onClick={() => setActiveImage(i)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-80 flex items-center justify-center text-6xl">
                {CATEGORIA_EMOJI[product.categoria]}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
            <p className="text-gray-600 text-sm whitespace-pre-line">{product.descricao}</p>
          </div>

          {/* Details */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Detalhes</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Categoria</p>
                <p className="font-medium">{CATEGORIA_LABELS[product.categoria]}</p>
              </div>
              <div>
                <p className="text-gray-500">Quantidade disponível</p>
                <p className="font-medium">{product.quantidade} {product.unidade}</p>
              </div>
              <div>
                <p className="text-gray-500">Preço</p>
                <p className="font-medium text-blue-700">{fmtBRL(product.preco)}</p>
              </div>
              <div>
                <p className="text-gray-500">Negociável</p>
                <p className="font-medium">{product.precoNegociavel ? 'Sim' : 'Não'}</p>
              </div>
              {product.cidade && (
                <div>
                  <p className="text-gray-500">Cidade</p>
                  <p className="font-medium">{product.cidade}</p>
                </div>
              )}
              {product.estado && (
                <div>
                  <p className="text-gray-500">Estado</p>
                  <p className="font-medium">{product.estado}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Publicado</p>
                <p className="font-medium">{timeAgo(product.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Visualizações</p>
                <p className="font-medium">{product.visualizacoes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: price box + seller + contact */}
        <div className="space-y-4">
          {/* Price box */}
          <div className="card">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-3xl font-bold text-blue-700">{fmtBRL(product.preco)}</p>
                <p className="text-sm text-gray-500">
                  por {product.unidade}
                  {product.precoNegociavel && (
                    <span className="ml-2 text-orange-600 font-medium">• Negociável</span>
                  )}
                </p>
              </div>
              <button
                onClick={handleToggleFav}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-red-50 transition-colors"
              >
                <span className="text-xl">{product.isFavorito ? '❤️' : '🤍'}</span>
              </button>
            </div>

            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${STATUS_COLORS[product.status]}`}>
              {STATUS_LABELS[product.status]}
            </span>

            {/* Contact buttons */}
            <div className="mt-4 space-y-2">
              {product.contatoWhatsapp && (
                <a
                  href={`https://wa.me/55${product.contatoWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleContact('whatsapp')}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  💬 WhatsApp
                </a>
              )}
              {product.contatoTelefone && (
                <a
                  href={`tel:${product.contatoTelefone}`}
                  onClick={() => handleContact('telefone')}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  📞 Ligar: {product.contatoTelefone}
                </a>
              )}
              {product.contatoEmail && (
                <a
                  href={`mailto:${product.contatoEmail}`}
                  onClick={() => handleContact('email')}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  ✉️ Enviar email
                </a>
              )}
              {product.externalUrl && (
                <a
                  href={product.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleContact('link')}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  🔗 Ver anúncio externo
                </a>
              )}
              {!product.contatoWhatsapp && !product.contatoTelefone && !product.contatoEmail && !product.externalUrl && (
                <p className="text-center text-sm text-gray-400 py-2">
                  Nenhum contato disponível
                </p>
              )}
            </div>
          </div>

          {/* Seller */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Vendedor</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                {product.produtor.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{product.produtor.user.name}</p>
                {(product.produtor.cidade || product.produtor.estado) && (
                  <p className="text-xs text-gray-500">
                    {[product.produtor.cidade, product.produtor.estado].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Favorites count */}
          <p className="text-xs text-gray-400 text-center">
            ❤️ {product._count.favoritos} {product._count.favoritos === 1 ? 'pessoa favoritou' : 'pessoas favoritaram'} este produto
          </p>
        </div>
      </div>

      {/* Related products */}
      {product.relacionados && product.relacionados.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Produtos relacionados</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {product.relacionados.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Product Form ───────────────────────────────────────────────────────── */

const EMPTY_FORM: CreateMarketplaceData = {
  titulo: '', descricao: '', categoria: 'INSUMOS', preco: 0,
  precoNegociavel: false, quantidade: 1, unidade: 'un',
  cidade: '', estado: '', imageUrl: '',
  contatoWhatsapp: '', contatoEmail: '', contatoTelefone: '', externalUrl: '',
};

function ProductForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<CreateMarketplaceData>;
  onSave: (data: CreateMarketplaceData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CreateMarketplaceData>({ ...EMPTY_FORM, ...initial });
  const [error, setError] = useState('');

  const set = (patch: Partial<CreateMarketplaceData>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.titulo.trim() || !form.descricao.trim()) {
      setError('Título e descrição são obrigatórios.');
      return;
    }
    try {
      await onSave(form);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Erro ao salvar anúncio.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Título *</label>
          <input className="input" required minLength={3} maxLength={100} value={form.titulo} onChange={(e) => set({ titulo: e.target.value })} placeholder="Ex: Milho em grão seco — safra 2024" />
        </div>

        <div className="md:col-span-2">
          <label className="label">Descrição *</label>
          <textarea className="input h-28 resize-none" required minLength={10} maxLength={2000} value={form.descricao} onChange={(e) => set({ descricao: e.target.value })} placeholder="Descreva o produto, qualidade, condições..." />
        </div>

        <div>
          <label className="label">Categoria *</label>
          <select className="input" value={form.categoria} onChange={(e) => set({ categoria: e.target.value as MarketplaceCategoria })}>
            {ALL_CATEGORIAS.map((c) => <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Estado</label>
          <select className="input" value={form.estado ?? ''} onChange={(e) => set({ estado: e.target.value || undefined })}>
            <option value="">Selecione</option>
            {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Preço (R$) *</label>
          <input type="number" className="input" required min={0.01} step="0.01" value={form.preco || ''} onChange={(e) => set({ preco: Number(e.target.value) })} placeholder="0,00" />
        </div>

        <div>
          <label className="label">Cidade</label>
          <input className="input" maxLength={100} value={form.cidade ?? ''} onChange={(e) => set({ cidade: e.target.value })} placeholder="Ex: Ribeirão Preto" />
        </div>

        <div>
          <label className="label">Quantidade *</label>
          <input type="number" className="input" required min={0.001} step="any" value={form.quantidade || ''} onChange={(e) => set({ quantidade: Number(e.target.value) })} />
        </div>

        <div>
          <label className="label">Unidade</label>
          <input className="input" maxLength={20} value={form.unidade} onChange={(e) => set({ unidade: e.target.value })} placeholder="Ex: kg, sacas, cabeças" />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="negociavel" checked={form.precoNegociavel} onChange={(e) => set({ precoNegociavel: e.target.checked })} className="w-4 h-4 accent-blue-600" />
          <label htmlFor="negociavel" className="text-sm text-gray-700">Preço negociável</label>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Contato e links</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">WhatsApp (somente dígitos)</label>
            <input className="input" maxLength={11} value={form.contatoWhatsapp ?? ''} onChange={(e) => set({ contatoWhatsapp: e.target.value.replace(/\D/g, '') })} placeholder="11999999999" />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input className="input" maxLength={20} value={form.contatoTelefone ?? ''} onChange={(e) => set({ contatoTelefone: e.target.value })} placeholder="(11) 9 9999-9999" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input" maxLength={200} value={form.contatoEmail ?? ''} onChange={(e) => set({ contatoEmail: e.target.value })} placeholder="contato@exemplo.com" />
          </div>
          <div>
            <label className="label">Link externo</label>
            <input type="url" className="input" maxLength={2048} value={form.externalUrl ?? ''} onChange={(e) => set({ externalUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="label">URL da imagem principal</label>
            <input type="url" className="input" maxLength={2048} value={form.imageUrl ?? ''} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Salvando...' : 'Salvar anúncio'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ─── Dashboard View ─────────────────────────────────────────────────────── */

function DashboardView({ onBack }: { onBack: () => void }) {
  const [tab, setTab]         = useState<'listings' | 'favorites' | 'new'>('listings');
  const [listings, setListings] = useState<MarketplaceProduct[]>([]);
  const [favorites, setFavorites] = useState<MarketplaceProduct[]>([]);
  const [myStats, setMyStats]   = useState<MarketplaceMyStats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editing, setEditing]   = useState<MarketplaceProduct | null>(null);
  const [error, _setError]      = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [lRes, fRes, sRes] = await Promise.allSettled([
      marketplaceService.myListings(),
      marketplaceService.myFavorites(),
      marketplaceService.myStats(),
    ]);
    if (lRes.status === 'fulfilled') setListings(lRes.value);
    if (fRes.status === 'fulfilled') setFavorites(fRes.value);
    if (sRes.status === 'fulfilled') setMyStats(sRes.value);
    else setMyStats({ ativos: 0, inativos: 0, vendidos: 0, totalViews: 0, totalFavoritos: 0, totalContatos: 0 });
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (data: CreateMarketplaceData) => {
    setSaving(true);
    try {
      await marketplaceService.create(data);
      await loadData();
      setTab('listings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: CreateMarketplaceData) => {
    if (!editing) return;
    setSaving(true);
    try {
      await marketplaceService.update(editing.id, data as UpdateMarketplaceData);
      await loadData();
      setEditing(null);
      setTab('listings');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await marketplaceService.updateStatus(id, status);
      setListings((prev) => prev.map((p) => p.id === id ? { ...p, status: status as MarketplaceProduct['status'] } : p));
    } catch { /* silent */ }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este anúncio?')) return;
    try {
      await marketplaceService.remove(id);
      setListings((prev) => prev.filter((p) => p.id !== id));
    } catch { /* silent */ }
  };

  const handleUnfav = async (id: string) => {
    try {
      await marketplaceService.toggleFavorito(id);
      setFavorites((prev) => prev.filter((p) => p.id !== id));
    } catch { /* silent */ }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="text-blue-600 hover:text-blue-800 text-sm">← Cancelar edição</button>
          <h2 className="font-bold text-gray-900">Editar anúncio</h2>
        </div>
        <div className="card">
          <ProductForm
            initial={{
              titulo: editing.titulo, descricao: editing.descricao,
              categoria: editing.categoria, preco: editing.preco,
              precoNegociavel: editing.precoNegociavel, quantidade: editing.quantidade,
              unidade: editing.unidade, cidade: editing.cidade ?? '',
              estado: editing.estado ?? '', imageUrl: editing.imageUrl ?? '',
              contatoWhatsapp: editing.contatoWhatsapp ?? '',
              contatoEmail: editing.contatoEmail ?? '',
              contatoTelefone: editing.contatoTelefone ?? '',
              externalUrl: editing.externalUrl ?? '',
            }}
            onSave={handleUpdate}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 text-sm font-medium">← Marketplace</button>
        <h2 className="font-bold text-gray-900 text-lg">Meu painel</h2>
      </div>

      {/* Stats */}
      {myStats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: 'Ativos',     value: myStats.ativos,         icon: '✅' },
            { label: 'Inativos',   value: myStats.inativos,       icon: '⏸️' },
            { label: 'Vendidos',   value: myStats.vendidos,       icon: '💰' },
            { label: 'Views',      value: myStats.totalViews,     icon: '👁' },
            { label: 'Favoritos',  value: myStats.totalFavoritos, icon: '❤️' },
            { label: 'Contatos',   value: myStats.totalContatos,  icon: '📞' },
          ].map((s) => (
            <div key={s.label} className="card text-center py-3">
              <div className="text-lg">{s.icon}</div>
              <div className="text-xl font-bold text-blue-700 mt-0.5">{s.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: 'listings'  as const, label: `Meus anúncios (${listings.length})` },
          { id: 'favorites' as const, label: `Favoritos (${favorites.length})` },
          { id: 'new'       as const, label: '+ Novo anúncio' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'new' && (
        <div className="card">
          <ProductForm onSave={handleCreate} onCancel={() => setTab('listings')} saving={saving} />
        </div>
      )}

      {tab === 'listings' && (
        loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-2">📦</p>
            <p className="font-semibold text-gray-700">Nenhum anúncio ainda</p>
            <button onClick={() => setTab('new')} className="btn-primary mt-4 text-sm px-6">
              Criar primeiro anúncio
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((p) => (
              <div key={p.id} className="card flex gap-4 items-start">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-blue-50 flex-shrink-0 flex items-center justify-center text-2xl">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    : CATEGORIA_EMOJI[p.categoria]
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{p.titulo}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </div>
                  <p className="text-blue-700 font-bold text-sm mt-0.5">{fmtBRL(p.preco)}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>👁 {p.visualizacoes}</span>
                    <span>❤️ {p._count.favoritos}</span>
                    <span>{timeAgo(p.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => setEditing(p)} className="btn-secondary text-xs px-3 py-1.5">
                    Editar
                  </button>
                  {p.status === 'ATIVO' && (
                    <button onClick={() => handleStatusChange(p.id, 'INATIVO')} className="btn-secondary text-xs px-3 py-1.5">
                      Pausar
                    </button>
                  )}
                  {p.status === 'INATIVO' && (
                    <button onClick={() => handleStatusChange(p.id, 'ATIVO')} className="btn-secondary text-xs px-3 py-1.5">
                      Ativar
                    </button>
                  )}
                  {p.status !== 'VENDIDO' && (
                    <button onClick={() => handleStatusChange(p.id, 'VENDIDO')} className="btn-secondary text-xs px-3 py-1.5 text-green-700">
                      Vendido
                    </button>
                  )}
                  <button onClick={() => handleRemove(p.id)} className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200">
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'favorites' && (
        favorites.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-2">🤍</p>
            <p className="font-semibold text-gray-700">Nenhum favorito ainda</p>
            <p className="text-sm text-gray-400 mt-1">Explore o marketplace e favorite produtos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((p) => (
              <div key={p.id} className="relative">
                <ProductCard
                  product={{ ...p, isFavorito: true }}
                  onSelect={() => {}}
                  onToggleFav={handleUnfav}
                />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────────── */

export function Marketplace() {
  const { user } = useAuthStore();
  const [view, setView]               = useState<View>('home');
  const [listingFilters, setListingFilters] = useState<MarketplaceFilters>({});
  const [detailId, setDetailId]       = useState<string | null>(null);

  const navigateTo = useCallback((v: View, filters?: MarketplaceFilters) => {
    setView(v);
    if (filters) setListingFilters(filters);
  }, []);

  const selectProduct = useCallback((p: MarketplaceProduct) => {
    setDetailId(p.id);
    setView('detail');
  }, []);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-500 text-sm mt-0.5">Compre e venda produtos agrícolas</p>
        </div>
        <div className="flex gap-2">
          {view !== 'home' && (
            <button
              onClick={() => navigateTo('home')}
              className="btn-secondary text-sm px-4"
            >
              Início
            </button>
          )}
          {view !== 'listing' && (
            <button
              onClick={() => navigateTo('listing')}
              className="btn-secondary text-sm px-4"
            >
              Ver todos
            </button>
          )}
          {user && view !== 'dashboard' && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="btn-primary text-sm px-4"
            >
              Meu painel
            </button>
          )}
        </div>
      </div>

      {/* Views */}
      {view === 'home' && (
        <HomeView
          onNavigate={navigateTo}
          onSelectProduct={selectProduct}
          isLoggedIn={!!user}
        />
      )}

      {view === 'listing' && (
        <ListingView
          initialFilters={listingFilters}
          onSelectProduct={selectProduct}
          onBack={() => navigateTo('home')}
        />
      )}

      {view === 'detail' && detailId && (
        <DetailView
          productId={detailId}
          onBack={() => setView('listing')}
          onSelectProduct={selectProduct}
        />
      )}

      {view === 'dashboard' && user && (
        <DashboardView onBack={() => navigateTo('home')} />
      )}
    </div>
  );
}
