import { useState, useEffect } from 'react';
import { formatCurrency, formatCurrencyDecimal } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Filter, X } from 'lucide-react';

/**
 * Página de Catálogo
 * Versão corrigida com Cards bem definidos e UI equilibrada
 */
export default function Catalog() {
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPriceReais, setMaxPriceReais] = useState(1000);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: 0,
    maxPrice: 100000,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const { products, loading, pagination } = useProducts(page, 20, filters);
  const { addItem, items } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleMaxPriceChange = (value: number) => {
    setMaxPriceReais(value);
    setFilters(prev => ({ ...prev, maxPrice: value * 100 }));
    setPage(1);
  };

  const handleQuickAddToCart = async (product: any) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error('Produto sem variantes disponíveis');
      return;
    }
    const variant = product.variants[0];
    if (variant.stock <= 0 || product.totalStock <= 0) {
      toast.error('Produto sem estoque disponível');
      return;
    }
    const itemKey = `${product.id}-${variant.id}`;
    const existingItem = items.find(item =>
      item.productId === product.id && item.variantId === variant.id
    );

    if (existingItem) {
      toast.info(`${product.name} já está no carrinho!`, {
        description: `Quantidade atual: ${existingItem.quantity}`,
        duration: 2000,
      });
      return;
    }

    setAddingToCart(prev => new Set(prev).add(itemKey));
    const cartItem = {
      id: itemKey,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: product.priceInCents / 100,
      quantity: 1,
      image: product.images?.[0]?.url,
      size: variant.size,
      color: variant.color,
    };
    addItem(cartItem);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      icon: '🛒',
      duration: 2000,
    });
    setTimeout(() => {
      setAddingToCart(prev => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Clássico */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Catálogo</h1>
          <p className="text-muted-foreground">Nossos produtos</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filters Trigger */}
        <div className="lg:hidden mb-6">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Conteudo Filtros Mobile igual Desktop */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Buscar</label>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Categoria</label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Todas</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <Button
                  className="w-full" variant="secondary"
                  onClick={() => {
                    setFilters({ search: '', categoryId: '', minPrice: 0, maxPrice: 100000 });
                    setPage(1);
                    setFiltersOpen(false);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Filtros</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Buscar</label>
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Categoria</label>
                    <select
                      value={filters.categoryId}
                      onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Todas</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button
                    className="w-full" variant="outline"
                    onClick={() => {
                      setFilters({ search: '', categoryId: '', minPrice: 0, maxPrice: 100000 });
                      setPage(1);
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Produtos */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const variant = product.variants?.[0];
                  const isInCart = items.some(item =>
                    item.productId === product.id && item.variantId === variant?.id
                  );
                  const hasStock = variant && variant.stock > 0;
                  const isAdding = addingToCart.has(`${product.id}-${variant?.id}`);

                  return (
                    <Card key={product.id} className="group overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 border border-border/60">
                      {/* Imagem */}
                      <a href={`/produto/${product.slug}`} className="block relative aspect-square bg-gray-100 overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">Sem imagem</div>
                        )}
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {isInCart && (
                            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                              NO CARRINHO
                            </span>
                          )}
                          {!hasStock && (
                            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                              ESGOTADO
                            </span>
                          )}
                        </div>
                      </a>

                      {/* Conteudo */}
                      <div className="p-4">
                        <a href={`/produto/${product.slug}`} className="block mb-2">
                          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 h-5">
                            {product.shortDescription}
                          </p>
                        </a>

                        <div className="flex items-center justify-between mt-4">
                          <span className="font-bold text-lg">
                            {formatCurrency(product.priceInCents)}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <a href={`/produto/${product.slug}`}>
                            <Button variant="outline" className="w-full h-9 text-xs">
                              Detalhes
                            </Button>
                          </a>
                          <Button
                            className="w-full h-9 text-xs"
                            size="sm"
                            disabled={!hasStock || isInCart || isAdding}
                            onClick={() => handleQuickAddToCart(product)}
                          >
                            {isInCart ? 'No Carrinho' : !hasStock ? 'Esgotado' : 'Adicionar'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination simplificada */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                <span className="py-1 px-3 text-sm font-medium">{page} de {pagination.pages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>Próxima</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
