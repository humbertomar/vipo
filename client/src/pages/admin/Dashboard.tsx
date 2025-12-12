import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
    Users,
    DollarSign,
    ShoppingBag,
    Activity,
    TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveTable } from "@/components/ResponsiveTable";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeOrders: 0,
        totalSales: 0,
        pendingOrders: 0
    });
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real data from API
        fetch('/api/orders?limit=100')
            .then(res => res.json())
            .then(data => {
                const orders = data.data || [];
                setRecentSales(orders.slice(0, 5)); // Take only 5 recent

                // Calculate metrics
                const revenue = orders.reduce((acc: number, order: any) => acc + order.totalInCents, 0);
                const active = orders.filter((o: any) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length;
                const pending = orders.filter((o: any) => o.status === 'PENDING').length;

                setStats({
                    totalRevenue: revenue,
                    activeOrders: active,
                    totalSales: orders.length,
                    pendingOrders: pending
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar dashboard:", err);
                setLoading(false);
            });
    }, []);

    // Usa a função utilitária global

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Visão geral da sua loja
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Link href="/admin/vendas/nova" className="w-full md:w-auto">
                        <Button size="lg" className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all font-semibold w-full md:w-auto">
                            <ShoppingBag className="mr-2 h-5 w-5" /> Nova Venda
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            +20.1% em relação ao mês anterior
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.totalSales}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            Total de pedidos registrados
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Aguardando pagamento ou confirmação
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Ativos</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Em processamento ou confirmados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Sales & Updates - Mobile First */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Vendas Recentes</CardTitle>
                        <CardDescription>
                            últimos pedidos realizados na loja
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveTable
                            data={recentSales}
                            columns={[
                                {
                                    key: 'orderNumber',
                                    label: 'Pedido',
                                    render: (sale) => (
                                        <span className="font-medium">#{sale.orderNumber || (sale.id ? sale.id.substring(0, 8).toUpperCase() : 'N/A')}</span>
                                    )
                                },
                                {
                                    key: 'customer',
                                    label: 'Cliente',
                                    render: (sale) => (
                                        <span>{sale.user?.name || 'Cliente Balcão'}</span>
                                    )
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    render: (sale) => (
                                        <Badge variant={sale.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                            {sale.status}
                                        </Badge>
                                    )
                                },
                                {
                                    key: 'total',
                                    label: 'Valor',
                                    render: (sale) => (
                                        <span className="font-medium">{formatCurrency(sale.totalInCents)}</span>
                                    )
                                }
                            ]}
                            keyExtractor={(sale) => sale.id}
                            loading={loading}
                            emptyMessage="Nenhuma venda encontrada."
                        />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Atualizações</CardTitle>
                        <CardDescription>
                            Informações importantes da loja
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <span className="relative flex h-2 w-2 mt-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Pedidos Pendentes</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {stats.pendingOrders} pedido{stats.pendingOrders !== 1 ? 's' : ''} aguardando processamento
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <span className="h-2 w-2 bg-blue-500 rounded-full mt-1.5"></span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Receita do Mês</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Total: {formatCurrency(stats.totalRevenue)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <span className="h-2 w-2 bg-orange-500 rounded-full mt-1.5"></span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Vendas Realizadas</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {stats.totalSales} venda{stats.totalSales !== 1 ? 's' : ''} registrada{stats.totalSales !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
