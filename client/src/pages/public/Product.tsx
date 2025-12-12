import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProductBySlug } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

/**
 * Página de Detalhe do Produto
 * Exibe informações completas do produto
 */
export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProductBySlug(slug || '');
  const { addItem, removeItem, items } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddToCart = async (redirect: boolean = false) => {
    if (!product) return;

    const variantId = selectedVariant || product.variants?.[0]?.id;
    if (!variantId) {
      toast.error('Por favor, selecione uma variante');
      return;
    }

    const variant = product.variants?.find(v => v.id === variantId);
    if (!variant) {
      toast.error('Variante não encontrada');
      return;
    }

    // Validação de estoque para adição
    const currentInCart = items.find(item => item.variantId === variantId)?.quantity || 0;

    if (currentInCart + quantity > variant.stock) {
      toast.error(`Estoque insuficiente. Disponível: ${variant.stock}`);
      return;
    }

    setIsAdding(true);

    // Delay artificial removido para UX mais rápida

    const cartItem = {
      id: `${product.id}-${variantId}`,
      productId: product.id,
      variantId,
      name: product.name,
      price: product.priceInCents / 100,
      quantity,
      image: product.images?.[0]?.url,
      size: product.variants?.find(v => v.id === variantId)?.size,
      color: product.variants?.find(v => v.id === variantId)?.color,
    };

    addItem(cartItem);

    if (redirect) {
      setLocation('/carrinho');
    } else {
      toast.success(`${product.name} adicionado ao carrinho!`);
      setQuantity(1);
    }

    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="text-muted-foreground mb-6">{error || 'O produto que você procura não existe.'}</p>
          <a href="/catalogo">
            <Button>Voltar para Catálogo</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <a href="/catalogo" className="text-primary hover:underline mb-4 sm:mb-6 inline-block text-sm sm:text-base">
          ← Voltar para Catálogo
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2 sm:mb-4 shadow-md">
              {product.images && product.images.length > 0 ? (
                <img
                  src={selectedImage || product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Sem imagem</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <div
                    key={img.id}
                    className={`aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer transition-all ${selectedImage === img.url || (!selectedImage && index === 0)
                      ? 'ring-2 ring-primary opacity-100'
                      : 'opacity-70 hover:opacity-100'
                      }`}
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img
                      src={img.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{product.name}</h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6">{product.description}</p>

            <div className="mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-primary">
                {formatCurrency(product.priceInCents)}
              </span>
            </div>

            <div className="mb-4 sm:mb-6">
              {product.totalStock > 0 ? (
                <span className="text-green-600 font-semibold text-base sm:text-lg">✓ Em estoque ({product.totalStock} unidades)</span>
              ) : (
                <span className="text-gray-600 font-semibold text-base sm:text-lg">✗ SEM ESTOQUE</span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <label className="block font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Tamanho / Cor</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.variants.map((variant) => {
                    const hasStock = variant.stock > 0;
                    return (
                      <Button
                        key={variant.id}
                        variant={selectedVariant === variant.id ? 'default' : 'outline'}
                        onClick={() => setSelectedVariant(variant.id)}
                        className={`w-full py-4 sm:py-6 text-sm sm:text-base font-semibold transition-all touch-target ${!hasStock
                          ? 'opacity-50 cursor-not-allowed'
                          : selectedVariant === variant.id
                            ? 'shadow-lg shadow-primary/30'
                            : 'hover:scale-105 hover:shadow-lg'
                          }`}
                        disabled={!hasStock}
                      >
                        {variant.size} {variant.color && `- ${variant.color}`}
                        {!hasStock && ' (SEM ESTOQUE)'}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-4 sm:mb-6">
              <label className="block font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Quantidade</label>
              <div className="flex items-center gap-3 sm:gap-4 bg-secondary p-2 sm:p-3 rounded-lg w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isAdding || product.totalStock === 0}
                  className="w-8 h-8 sm:w-10 sm:h-10 font-bold text-base sm:text-lg hover:scale-110 touch-target"
                >
                  −
                </Button>
                <span className="text-lg sm:text-xl font-semibold w-6 sm:w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const variant = product.variants?.find(v => v.id === (selectedVariant || product.variants?.[0]?.id));
                    const maxStock = variant?.stock || product.totalStock || 0;
                    setQuantity(Math.min(quantity + 1, maxStock));
                  }}
                  disabled={isAdding || product.totalStock === 0 || quantity >= (product.variants?.find(v => v.id === (selectedVariant || product.variants?.[0]?.id))?.stock || product.totalStock || 0)}
                  className="w-8 h-8 sm:w-10 sm:h-10 font-bold text-base sm:text-lg hover:scale-110 touch-target"
                >
                  +
                </Button>
              </div>
              {(() => {
                const variant = product.variants?.find(v => v.id === (selectedVariant || product.variants?.[0]?.id));
                const availableStock = variant?.stock || product.totalStock || 0;
                return availableStock > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Estoque disponível: {availableStock} unidade{availableStock !== 1 ? 's' : ''}
                  </p>
                );
              })()}
            </div>

            {/* Add to Cart - Sticky on Mobile */}
            <div className="sticky bottom-0 left-0 right-0 bg-background pt-4 pb-4 sm:pb-0 sm:static border-t sm:border-0 -mx-4 px-4 sm:mx-0 sm:px-0 z-10">
              <div className="flex flex-col sm:flex-row gap-3">
                {(() => {
                  const variant = product.variants?.find(v => v.id === (selectedVariant || product.variants?.[0]?.id));
                  const currentInCartItem = items.find(item => item.variantId === variant?.id);
                  const isInCart = !!currentInCartItem;

                  return (
                    <>
                      {isInCart ? (
                        <div className="flex flex-col gap-3 w-full">
                          <Button
                            variant="default"
                            className="w-full h-14 text-lg font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-default shadow-sm"
                            disabled={true}
                          >
                            <span className="flex items-center gap-2">
                              <span className="h-5 w-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                              Item Adicionado ao Carrinho
                            </span>
                          </Button>

                          <Button
                            className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-900 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                            onClick={() => setLocation('/carrinho')}
                          >
                            Ir para o Carrinho →
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-3 w-full">
                          <Button
                            variant="outline"
                            className="h-14 px-8 border-2 border-black font-bold text-base hover:bg-gray-50 uppercase tracking-wide"
                            onClick={() => handleAddToCart(false)}
                            disabled={product.totalStock === 0 || isAdding}
                          >
                            Adicionar
                          </Button>

                          <Button
                            className="flex-1 h-14 text-base font-bold bg-black text-white hover:bg-gray-900 shadow-lg uppercase tracking-wide"
                            onClick={() => handleAddToCart(true)}
                            disabled={product.totalStock === 0 || isAdding}
                          >
                            {product.totalStock === 0
                              ? 'Sem Estoque'
                              : isAdding
                                ? 'Adicionando...'
                                : 'Comprar Agora'}
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {product.attributes && product.attributes.length > 0 && (
              <Card className="mt-6 sm:mt-8 p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Especificações</h3>
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="flex justify-between py-2 border-b border-border last:border-0 text-sm sm:text-base">
                    <span className="text-muted-foreground">{attr.name}</span>
                    <span className="font-semibold">{attr.value}</span>
                  </div>
                ))}
              </Card>
            )}

            {product.category && (
              <Card className="mt-4 sm:mt-6 p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg mb-2">Categoria</h3>
                <a href={`/catalogo?categoryId=${product.category.id}`} className="text-primary hover:underline font-semibold">
                  {product.category.name}
                </a>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
