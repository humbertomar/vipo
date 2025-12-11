import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

/**
 * Painel Admin
 * Gerenciamento de produtos, pedidos, usuários e configurações
 */
export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch produtos
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products?limit=100');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pedidos
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // TODO: Implementar endpoint /api/orders
      const mockOrders = [
        { id: '1', customer: 'João Silva', total: 'R$ 299,90', status: 'CONFIRMED', date: '2025-10-22' },
        { id: '2', customer: 'Maria Santos', total: 'R$ 149,90', status: 'PENDING', date: '2025-10-21' },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Painel Admin - ViPO</h1>
          <p className="text-sm opacity-90">Gerenciamento de loja</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => {
              setActiveTab('dashboard');
            }}
            className={`pb-4 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('products');
              fetchProducts();
            }}
            className={`pb-4 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => {
              setActiveTab('orders');
              fetchOrders();
            }}
            className={`pb-4 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Configurações
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <h3 className="text-sm text-muted-foreground mb-2">Vendas Hoje</h3>
                <p className="text-3xl font-bold">R$ 1.299,90</p>
                <p className="text-xs text-green-600 mt-2">↑ 12% vs ontem</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm text-muted-foreground mb-2">Pedidos</h3>
                <p className="text-3xl font-bold">24</p>
                <p className="text-xs text-blue-600 mt-2">8 pendentes</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm text-muted-foreground mb-2">Produtos</h3>
                <p className="text-3xl font-bold">5</p>
                <p className="text-xs text-orange-600 mt-2">2 com estoque baixo</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm text-muted-foreground mb-2">Clientes</h3>
                <p className="text-3xl font-bold">142</p>
                <p className="text-xs text-purple-600 mt-2">12 novos</p>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Pedidos Recentes</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <p className="font-semibold">João Silva</p>
                    <p className="text-sm text-muted-foreground">Pedido #001</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ 299,90</p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">CONFIRMADO</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <p className="font-semibold">Maria Santos</p>
                    <p className="text-sm text-muted-foreground">Pedido #002</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ 149,90</p>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">PENDENTE</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Produtos</h2>
              <Button className="bg-primary text-primary-foreground">+ Novo Produto</Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p>Carregando...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Nome</th>
                      <th className="px-4 py-3 text-left font-semibold">SKU</th>
                      <th className="px-4 py-3 text-left font-semibold">Preço</th>
                      <th className="px-4 py-3 text-left font-semibold">Estoque</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-semibold">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{product.sku}</td>
                        <td className="px-4 py-3 font-bold">{formatCurrency(product.priceInCents)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${product.totalStock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.totalStock} un.
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm" className="mr-2">
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm">
                            Deletar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
              </Card>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pedidos</h2>

            {loading ? (
              <div className="text-center py-12">
                <p>Carregando...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Pedido</th>
                      <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                      <th className="px-4 py-3 text-left font-semibold">Total</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Data</th>
                      <th className="px-4 py-3 text-left font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-semibold">#{order.id}</td>
                        <td className="px-4 py-3">{order.customer}</td>
                        <td className="px-4 py-3 font-bold">{order.total}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{order.date}</td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Nenhum pedido encontrado</p>
              </Card>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Configurações</h2>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Informações da Loja</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Loja</label>
                  <input
                    type="text"
                    defaultValue="ViPO"
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email de Contato</label>
                  <input
                    type="email"
                    defaultValue="contato@vipo.com"
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <input
                    type="tel"
                    defaultValue="(62) 98241-9124"
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />
                </div>
                <Button className="bg-primary text-primary-foreground">Salvar Alterações</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Integrações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded">
                  <div>
                    <p className="font-semibold">Pagar.me</p>
                    <p className="text-sm text-muted-foreground">Processamento de pagamentos</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded">
                  <div>
                    <p className="font-semibold">Melhor Envio</p>
                    <p className="text-sm text-muted-foreground">Cálculo de frete</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

