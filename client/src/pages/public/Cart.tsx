import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { WHATSAPP_NUMBER } from '@/config/store';
import { MessageCircle, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatCurrencyDecimal } from '@/lib/utils';

/**
 * Página de Carrinho
 * Exibe itens no carrinho e permite checkout
 */
export default function Cart() {
  const { items, total, removeItem, updateQuantity } = useCart();

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success('Produto removido do carrinho');
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    updateQuantity(id, quantity);
  };

  const handleWhatsAppCheckout = () => {
    if (!WHATSAPP_NUMBER) {
      toast.error("Configuração de WhatsApp ausente.");
      return;
    }

    let message = "Olá, quero fazer um pedido:\n\n";

    items.forEach((item, index) => {
      const variantInfo = (item.size || item.color) ? ` (${item.size || ''} ${item.color || ''})` : '';
      message += `${index + 1}) ${item.name}${variantInfo}\n   Qtd: ${item.quantity} - ${formatCurrencyDecimal(item.price * item.quantity)}\n`;
    });

    message += `\nTotal aproximado: ${formatCurrencyDecimal(total)}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 sm:py-16 text-center">
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🛒</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg">Adicione produtos para começar suas compras</p>
          <a href="/catalogo">
            <Button className="bg-primary text-primary-foreground px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg hover:shadow-lg touch-target">
              Explorar Catálogo
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Carrinho de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-3 sm:space-y-4">
              {items.map(item => (
                <Card key={item.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-muted rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-500">Sem imagem</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 truncate">{item.name}</h3>
                      {(item.size || item.color) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.size} {item.color && `- ${item.color}`}
                        </p>
                      )}
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        {formatCurrencyDecimal(item.price)}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-2 sm:gap-0 w-full sm:w-auto">
                      <div className="flex items-center gap-1 sm:gap-2 bg-secondary p-1.5 sm:p-2 rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 p-0 touch-target"
                        >
                          −
                        </Button>
                        <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 p-0 touch-target"
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="mt-2 sm:mt-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 touch-target"
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Summary - Sticky on mobile */}
          <div className="lg:col-span-1">
            <Card className="p-4 sm:p-6 lg:sticky lg:top-24 shadow-lg">
              <h2 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-6">Resumo do Pedido</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatCurrencyDecimal(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">{formatCurrencyDecimal(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete:</span>
                  <span className="font-semibold">A combinar</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-xl mb-6 text-primary">
                <span>Total:</span>
                <span>{formatCurrencyDecimal(total)}</span>
              </div>

              <Button
                onClick={handleWhatsAppCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 sm:py-6 text-base sm:text-lg font-bold hover:shadow-lg transition-all mb-3 touch-target"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Finalizar pelo WhatsApp
              </Button>

              {/*               <a href="/checkout" className="block mb-3">
                <Button variant="outline" className="w-full py-4 sm:py-6 text-base sm:text-lg touch-target">
                  Checkout Web (Opcional)
                </Button>
              </a> */}

              <a href="/catalogo" className="block">
                <Button variant="outline" className="w-full py-4 sm:py-6 text-base sm:text-lg hover:bg-secondary hover:text-foreground transition-all touch-target">
                  Continuar Comprando
                </Button>
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

