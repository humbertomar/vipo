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
      {/* Banner Carrossel */}
      <div style={{ position: 'relative', height: '24rem', overflow: 'hidden', backgroundColor: '#000' }}>
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
            <div style={{ textAlign: 'center', color: 'white', paddingLeft: '1rem', paddingRight: '1rem', maxWidth: '42rem' }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                {banner.title}
              </h1>
              <p style={{ fontSize: '1.25rem', color: '#d1d5db', marginBottom: '2rem', fontWeight: '300' }}>
                {banner.subtitle}
              </p>
              <a href="/catalogo">
                <Button style={{ backgroundColor: 'white', color: 'black', paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1.5rem', paddingBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 'bold' }} className="hover:bg-gray-100 transition-all hover:shadow-xl">
                  {banner.cta}
                </Button>
              </a>
            </div>
          </div>
        ))}

        {/* Indicadores de Banner */}
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.75rem', zIndex: 10 }}>
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
      <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Destaques da Semana</h2>
          <div style={{ width: '5rem', height: '0.25rem', backgroundColor: 'black', borderRadius: '9999px' }}></div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem', marginTop: '1rem' }}>
            Confira os produtos mais procurados da ViPO
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {skeletonCards.map((_, i) => (
              <div key={i} style={{ backgroundColor: '#e5e7eb', height: '20rem', borderRadius: '0.75rem' }} />
            ))}
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {featuredProducts.map((product) => (
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
                    {product.isFeatured && (
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
                      <Button style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid #e5e7eb', color: 'black' }} className="hover:bg-gray-100 transition-all">
                        Ver
                      </Button>
                    </a>
                    <Button
                      style={{ flex: 1, backgroundColor: 'black', color: 'white' }}
                      className="hover:bg-gray-800 transition-all"
                      onClick={() => handleQuickAddToCart(product)}
                    >
                      🛒
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem' }}>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Nenhum produto em destaque no momento</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div style={{ backgroundColor: 'black', color: 'white', paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Pronto para começar?</h2>
          <p style={{ color: '#d1d5db', fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
            Explore nossa coleção completa de sungas e uniformes para futebol com qualidade premium
          </p>
          <a href="/catalogo">
            <Button style={{ backgroundColor: 'white', color: 'black', paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1.5rem', paddingBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 'bold' }} className="hover:bg-gray-100 hover:shadow-xl transition-all">
              Ir para Catálogo
            </Button>
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }}>🚚</div>
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

