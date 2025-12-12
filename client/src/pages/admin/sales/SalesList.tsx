import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { formatCurrency } from '@/lib/utils';
import { ResponsiveTable } from '@/components/ResponsiveTable';

export default function SalesList() {
    const [activeTab, setActiveTab] = useState<'ALL' | 'WHATSAPP' | 'POS'>('ALL');
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [_, setLocation] = useLocation();

    useEffect(() => {
        setLoading(true);
        fetch('/api/orders?limit=50')
            .then(res => res.json())
            .then(data => {
                setSales(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredSales = activeTab === 'ALL'
        ? sales
        : sales.filter((s: any) => {
            const method = s.payment?.method || s.paymentMethod || '';
            const isPos = method.startsWith('POS') || method === 'CASH';
            return activeTab === 'POS' ? isPos : !isPos;
        });

    const handleViewSale = (sale: any) => {
        setLocation(`/admin/vendas/${sale.id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendas</h1>
                <Link href="/admin/vendas/nova" className="w-full sm:w-auto">
                    <Button size="lg" className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all font-semibold w-full sm:w-auto touch-target">
                        <Plus className="mr-2 h-5 w-5" />
                        Nova Venda
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-2 p-1 bg-muted rounded-lg w-full sm:w-auto overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('ALL')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap touch-target ${activeTab === 'ALL' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setActiveTab('WHATSAPP')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap touch-target ${activeTab === 'WHATSAPP' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                WhatsApp
                            </button>
                            <button
                                onClick={() => setActiveTab('POS')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap touch-target ${activeTab === 'POS' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Balcão
                            </button>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar vendas..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveTable
                        data={filteredSales}
                        columns={[
                            {
                                key: 'orderNumber',
                                label: 'Pedido',
                                render: (sale) => (
                                    <span className="font-medium">#{sale.orderNumber || sale.id.substring(0, 8).toUpperCase()}</span>
                                )
                            },
                            {
                                key: 'customer',
                                label: 'Cliente',
                                render: (sale) => <span>{sale.user?.name || 'Cliente Balcão'}</span>
                            },
                            {
                                key: 'type',
                                label: 'Tipo',
                                render: (sale) => {
                                    const method = sale.payment?.method || sale.paymentMethod || '';
                                    const isPos = method.startsWith('POS') || method === 'CASH';
                                    return (
                                        <Badge variant="outline">
                                            {isPos ? 'Balcão' : 'WhatsApp'}
                                        </Badge>
                                    );
                                },
                                hideOnMobile: true
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (sale) => (
                                    <Badge variant={sale.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                        {sale.status === 'CONFIRMED' ? 'Confirmado' :
                                            sale.status === 'PENDING' ? 'Pendente' : sale.status}
                                    </Badge>
                                )
                            },
                            {
                                key: 'total',
                                label: 'Total',
                                render: (sale) => (
                                    <span className="font-bold">{formatCurrency(sale.totalInCents)}</span>
                                )
                            },
                            {
                                key: 'date',
                                label: 'Data',
                                render: (sale) => (
                                    <span className="text-muted-foreground text-sm">
                                        {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                ),
                                hideOnMobile: true
                            },
                            {
                                key: 'actions',
                                label: 'Ações',
                                render: (sale) => (
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewSale(sale)}
                                            className="touch-target"
                                        >
                                            Ver
                                        </Button>
                                    </div>
                                )
                            }
                        ]}
                        keyExtractor={(sale) => sale.id}
                        loading={loading}
                        emptyMessage="Nenhuma venda encontrada."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
