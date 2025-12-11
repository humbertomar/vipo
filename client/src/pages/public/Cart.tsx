import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { WHATSAPP_NUMBER } from '@/config/store';
import { MessageCircle } from 'lucide-react';
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
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-4xl font-bold mb-4">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-8 text-lg">Adicione produtos para começar suas compras</p>
          <a href="/catalogo">
            <Button className="bg-primary text-primary-foreground px-8 py-6 text-lg hover:shadow-lg">
              Explorar Catálogo
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Carrinho de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map(item => (
                <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-6">
                    <div className="w-28 h-28 bg-muted rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
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
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                      {(item.size || item.color) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.size} {item.color && `- ${item.color}`}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrencyDecimal(item.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-2 bg-secondary p-2 rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          −
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="mt-4"
                      >
                        🗑️ Remover
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 shadow-lg">
              <h2 className="font-bold text-2xl mb-6">Resumo do Pedido</h2>

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
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold hover:shadow-lg transition-all mb-3"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Finalizar pelo WhatsApp
              </Button>

              <a href="/checkout" className="block mb-3">
                <Button variant="outline" className="w-full py-6 text-lg">
                  Checkout Web (Opcional)
                </Button>
              </a>

              <a href="/catalogo" className="block">
                <Button variant="ghost" className="w-full py-6 text-lg hover:bg-secondary transition-all">
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

