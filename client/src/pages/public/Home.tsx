import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

/**
 * Página Home
 * Landing page com hero, produtos em destaque e CTA
 */
export default function Home() {
  const { products: featuredProducts, loading } = useProducts(1, 4);
  const { addItem } = useCart();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const banners = useMemo(() => [
    {
      title: 'Sungas com Atitude',
      subtitle: 'Qualidade, design e conforto em cada peça',
      cta: 'Explorar Catálogo',
      gradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
    },
    {
      title: 'Coleção Verão 2024',
      subtitle: 'Novas cores e modelos chegando',
      cta: 'Ver Novidades',
      gradient: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
    },
    {
      title: 'Frete Grátis',
      subtitle: 'Em compras acima de R$ 200',
      cta: 'Aproveitar',
      gradient: 'linear-gradient(135deg, #000000 0%, #2a2a2a 50%, #000000 100%)',
    },
  ], []);

  // Rotacionar banner a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleQuickAddToCart = useCallback((product: any) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error('Produto sem variantes disponíveis');
      return;
    }

    const variant = product.variants[0];

    // Validação de estoque
    if (variant.stock <= 0 || product.totalStock <= 0) {
      toast.error('Produto sem estoque disponível');
      return;
    }

    const cartItem = {
      id: `${product.id}-${variant.id}`, // ID consistente sem Date.now()
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
    toast.success(`${product.name} adicionado ao carrinho!`);
  }, [addItem]);

  const skeletonCards = useMemo(() => [...Array(4)], []);

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Carrossel - Mobile First: menor no mobile, maior no desktop */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden bg-black">
        {banners.map((banner, index) => (
          <div
            key={index}
            style={{
              background: banner.gradient,
              opacity: index === currentBannerIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="text-center text-white px-4 sm:px-6 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
                {banner.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 font-light">
                {banner.subtitle}
              </p>
              <a href="/catalogo">
                <Button className="bg-white text-black px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold hover:bg-gray-100 transition-all hover:shadow-xl touch-target">
                  {banner.cta}
                </Button>
              </a>
            </div>
          </div>
        ))}

        {/* Indicadores de Banner */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              style={{
                transition: 'all 0.3s',
                borderRadius: '9999px',
                backgroundColor: index === currentBannerIndex ? 'white' : '#9ca3af',
                width: index === currentBannerIndex ? '2rem' : '0.75rem',
                height: '0.75rem',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (index !== currentBannerIndex) {
                  (e.target as HTMLElement).style.backgroundColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentBannerIndex) {
                  (e.target as HTMLElement).style.backgroundColor = '#9ca3af';
                }
              }}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Seção de Destaques */}
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">Destaques da Semana</h2>
          <div className="w-16 sm:w-20 h-1 bg-black rounded-full"></div>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-3 sm:mt-4">
            Confira os produtos mais procurados da ViPO
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {skeletonCards.map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => {
              const variant = product.variants?.[0];
              const hasStock = variant && variant.stock > 0 && product.totalStock > 0;

              return (
                <Card
                  key={product.id}
                  style={{
                    overflow: 'hidden',
                    borderRadius: '0.75rem',
                    border: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
                    el.style.transform = 'translateY(-0.5rem)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  <a href={`/produto/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      aspectRatio: '1 / 1',
                      backgroundColor: '#e5e7eb',
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundImage: 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)',
                    }}>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.transform = 'scale(1)';
                          }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#9ca3af' }}>Sem imagem</span>
                        </div>
                      )}
                      {!hasStock && (
                        <div style={{
                          position: 'absolute',
                          top: '0.75rem',
                          left: '0.75rem',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          paddingLeft: '0.75rem',
                          paddingRight: '0.75rem',
                          paddingTop: '0.25rem',
                          paddingBottom: '0.25rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        }}>
                          SEM ESTOQUE
                        </div>
                      )}
                      {product.isFeatured && hasStock && (
                        <div style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          paddingLeft: '0.75rem',
                          paddingRight: '0.75rem',
                          paddingTop: '0.25rem',
                          paddingBottom: '0.25rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        }}>
                          Destaque
                        </div>
                      )}
                    </div>
                  </a>
                  <div style={{ padding: '1.25rem' }}>
                    <a href={`/produto/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 style={{
                        fontWeight: 'bold',
                        fontSize: '1.125rem',
                        marginBottom: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {product.name}
                      </h3>
                    </a>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '1rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: '2.5rem',
                    }}>
                      {product.shortDescription}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'black' }}>
                        {formatCurrency(product.priceInCents)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a href={`/produto/${product.slug}`} style={{ flex: 1, textDecoration: 'none' }}>
                        <Button
                          variant="outline"
                          style={{ width: '100%' }}
                        >
                          Ver
                        </Button>
                      </a>
                      <Button
                        style={{
                          flex: 1,
                          backgroundColor: hasStock ? 'black' : '#6b7280',
                          color: 'white',
                          cursor: hasStock ? 'pointer' : 'not-allowed',
                          boxShadow: hasStock ? '0 4px 6px -1px rgba(0,0,0,0.3)' : 'none'
                        }}
                        className={hasStock ? "hover:bg-gray-800 hover:shadow-xl hover:shadow-black/40 transition-all active:scale-95" : ""}
                        onClick={() => handleQuickAddToCart(product)}
                        disabled={!hasStock}
                      >
                        {hasStock ? '🛒' : 'SEM ESTOQUE'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-muted-foreground text-base sm:text-lg">Nenhum produto em destaque no momento</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-black text-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">Pronto para começar?</h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            Explore nossa coleção completa de sungas e uniformes para futebol com qualidade premium
          </p>
          <a href="/catalogo">
            <Button className="bg-white text-black px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold hover:bg-gray-100 hover:shadow-xl transition-all touch-target">
              Ir para Catálogo
            </Button>
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          <div className="text-center">
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🚚</div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Frete Rápido</h3>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              Entrega em até 7 dias úteis para todo Brasil com rastreamento
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }}>🛡️</div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Compra Segura</h3>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              Pagamento seguro com múltiplas opções e proteção ao comprador
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }}>💬</div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Suporte 24/7</h3>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              Atendimento via WhatsApp, email e chat para tirar suas dúvidas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

