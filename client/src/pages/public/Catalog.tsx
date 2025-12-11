import { useState, useEffect } from 'react';
import { formatCurrency, formatCurrencyDecimal } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

/**
 * Página de Catálogo
 * Listagem de produtos com filtros
 */
export default function Catalog() {
  const [page, setPage] = useState(1);
  // maxPrice em reais para o slider (0-1000)
  const [maxPriceReais, setMaxPriceReais] = useState(1000);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: 0,
    maxPrice: 100000, // em centavos (1000 reais)
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const { products, loading, pagination } = useProducts(page, 20, filters);
  const { addItem, items } = useCart();

  // Buscar categorias
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
    // Converte reais para centavos
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
    const itemKey = `${product.id}-${variant.id}`;
    
    // Verifica se já está no carrinho
    const existingItem = items.find(item => 
      item.productId === product.id && item.variantId === variant.id
    );

    if (existingItem) {
      // Se já existe, mostra mensagem e não adiciona novamente
      toast.info(`${product.name} já está no carrinho!`, {
        description: `Quantidade atual: ${existingItem.quantity}`,
        duration: 2000,
      });
      return;
    }

    // Adiciona feedback visual
    setAddingToCart(prev => new Set(prev).add(itemKey));

    const cartItem = {
      id: itemKey, // ID consistente
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
    
    // Feedback visual e toast
    toast.success(`${product.name} adicionado ao carrinho!`, {
      icon: '🛒',
      duration: 2000,
    });

    // Remove feedback visual após animação
    setTimeout(() => {
      setAddingToCart(prev => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-2">Catálogo Completo</h1>
          <p className="text-gray-300">Explore nossa coleção de sungas e uniformes</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24 border border-gray-200">
              <h2 className="font-bold text-xl mb-6">Filtros</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Buscar</label>
                <input
                  type="text"
                  placeholder="Nome do produto..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Categoria</label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all hover:border-gray-400 cursor-pointer"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Preço Máximo</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={maxPriceReais}
                  onChange={(e) => handleMaxPriceChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black hover:accent-gray-800 transition-all"
                  style={{
                    background: `linear-gradient(to right, #000 0%, #000 ${(maxPriceReais / 1000) * 100}%, #e5e7eb ${(maxPriceReais / 1000) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">R$ 0,00</span>
                  <span className="text-sm font-semibold text-black bg-gray-100 px-3 py-1 rounded-md">
                    Até {formatCurrencyDecimal(maxPriceReais)}
                  </span>
                  <span className="text-xs text-gray-500">R$ 1.000,00</span>
                </div>
              </div>

              {/* Reset Filters */}
              <Button
                variant="outline"
                className="w-full hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all duration-200"
                onClick={() => {
                  setMaxPriceReais(1000);
                  setFilters({
                    search: '',
                    categoryId: '',
                    minPrice: 0,
                    maxPrice: 100000,
                  });
                  setPage(1);
                }}
              >
                🔄 Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-muted h-80 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar seus filtros
                </p>
                <Button
                  onClick={() => {
                    setMaxPriceReais(1000);
                    setFilters({
                      search: '',
                      categoryId: '',
                      minPrice: 0,
                      maxPrice: 100000,
                    });
                    setPage(1);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => {
                    const itemKey = `${product.id}-${product.variants?.[0]?.id}`;
                    const isInCart = items.some(item => 
                      item.productId === product.id && item.variantId === product.variants?.[0]?.id
                    );
                    const isAdding = addingToCart.has(itemKey);
                    
                    return (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-gray-200 hover:border-gray-300"
                    >
                      <a href={`/produto/${product.slug}`} className="block">
                        <div className="aspect-square bg-muted overflow-hidden relative bg-gradient-to-br from-gray-200 to-gray-300">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-500">Sem imagem</span>
                            </div>
                          )}
                          {product.isFeatured && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                              ⭐ Destaque
                            </div>
                          )}
                          {isInCart && (
                            <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                              ✓ No carrinho
                            </div>
                          )}
                        </div>
                      </a>
                      <div className="p-5">
                        <a href={`/produto/${product.slug}`}>
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-black transition-colors">
                            {product.name}
                          </h3>
                        </a>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">
                          {product.shortDescription}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold text-black">
                            {formatCurrency(product.priceInCents)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <a href={`/produto/${product.slug}`} className="flex-1">
                            <Button 
                              variant="outline" 
                              className="w-full hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200"
                            >
                              Ver Detalhes
                            </Button>
                          </a>
                          <Button
                            className={`flex-1 transition-all duration-200 relative overflow-hidden ${
                              isAdding
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : isInCart
                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                : 'bg-black text-white hover:bg-gray-800'
                            } active:scale-95`}
                            onClick={() => handleQuickAddToCart(product)}
                            disabled={isAdding || isInCart}
                          >
                            {isAdding ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Adicionando...
                              </span>
                            ) : isInCart ? (
                              <span className="flex items-center justify-center gap-2">
                                <span>✓</span>
                                No Carrinho
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-2">
                                <span>🛒</span>
                                Adicionar
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="hover:bg-gray-100 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                        (p) => (
                          <Button
                            key={p}
                            variant={page === p ? 'default' : 'outline'}
                            onClick={() => setPage(p)}
                            className={`transition-all duration-200 active:scale-95 ${
                              page === p 
                                ? 'bg-black text-white hover:bg-gray-800 shadow-md' 
                                : 'hover:bg-gray-100 hover:border-gray-400'
                            }`}
                          >
                            {p}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      disabled={page === pagination.pages}
                      onClick={() => setPage(page + 1)}
                      className="hover:bg-gray-100 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

