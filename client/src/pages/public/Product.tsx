import { useState } from 'react';
import { useParams } from 'wouter';
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
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;
    
    const variantId = selectedVariant || product.variants?.[0]?.id;
    if (!variantId) {
      toast.error('Por favor, selecione uma variante');
      return;
    }

    setIsAdding(true);
    
    // Simular delay de API
    setTimeout(() => {
      const cartItem = {
        id: `${product.id}-${variantId}`, // ID consistente sem Date.now()
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
      toast.success(`${product.name} adicionado ao carrinho!`);
      setQuantity(1);
      setIsAdding(false);
    }, 300);
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
      <div className="container mx-auto px-4 py-8">
        <a href="/catalogo" className="text-primary hover:underline mb-6 inline-block">
          ← Voltar para Catálogo
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4 shadow-md">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Sem imagem</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img) => (
                  <div key={img.id} className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
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
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-muted-foreground text-lg mb-6">{product.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary">
                {formatCurrency(product.priceInCents)}
              </span>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.totalStock > 0 ? (
                <span className="text-green-600 font-semibold text-lg">✓ Em estoque ({product.totalStock} unidades)</span>
              ) : (
                <span className="text-red-600 font-semibold text-lg">✗ Fora de estoque</span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block font-semibold mb-3 text-lg">Tamanho / Cor</label>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === variant.id ? 'default' : 'outline'}
                      onClick={() => setSelectedVariant(variant.id)}
                      className="w-full py-6 text-base transition-all hover:scale-105"
                      disabled={variant.stock === 0}
                    >
                      {variant.size} {variant.color && `- ${variant.color}`}
                      {variant.stock === 0 && ' (Indisponível)'}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block font-semibold mb-3 text-lg">Quantidade</label>
              <div className="flex items-center gap-4 bg-secondary p-3 rounded-lg w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isAdding}
                  className="w-10 h-10"
                >
                  −
                </Button>
                <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isAdding}
                  className="w-10 h-10"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-8 text-lg font-bold transition-all hover:shadow-lg disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={product.totalStock === 0 || isAdding}
            >
              {isAdding ? '⏳ Adicionando...' : '🛒 Adicionar ao Carrinho'}
            </Button>

            {/* Product Details */}
            {product.attributes && product.attributes.length > 0 && (
              <Card className="mt-8 p-6">
                <h3 className="font-bold text-lg mb-4">Especificações</h3>
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{attr.name}</span>
                    <span className="font-semibold">{attr.value}</span>
                  </div>
                ))}
              </Card>
            )}

            {/* Category Info */}
            {product.category && (
              <Card className="mt-6 p-6">
                <h3 className="font-bold text-lg mb-2">Categoria</h3>
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

