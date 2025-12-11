
import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { formatCurrency } from '@/lib/utils';

export default function SalesList() {
    const [activeTab, setActiveTab] = useState<'ALL' | 'ONLINE' | 'POS'>('ALL');
    const [sales, setSales] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/orders?limit=50')
            .then(res => res.json())
            .then(data => setSales(data.data || []))
            .catch(console.error);
    }, []);

    const [_, setLocation] = useLocation();

    // ... useEffect ...

    // Combined filteredSales logic to be robust
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
                <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
                <Link href="/admin/vendas/nova">
                    <Button asChild>
                        <span>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Venda (POS)
                        </span>
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2 p-1 bg-muted rounded-lg">
                            <button
                                onClick={() => setActiveTab('ALL')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'ALL' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setActiveTab('ONLINE')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'ONLINE' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Online
                            </button>
                            <button
                                onClick={() => setActiveTab('POS')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'POS' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Balcão (POS)
                            </button>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar vendas..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.map((sale) => {
                                const method = sale.payment?.method || sale.paymentMethod || '';
                                const isPos = method.startsWith('POS') || method === 'CASH';

                                return (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-medium">#{sale.orderNumber || sale.id.substring(0, 8)}</TableCell>
                                        <TableCell>{sale.user?.name || 'Cliente Balcão'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {isPos ? 'Balcão' : 'Online'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={sale.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                                {sale.status === 'CONFIRMED' ? 'Confirmado' :
                                                    sale.status === 'PENDING' ? 'Pendente' : sale.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {formatCurrency(sale.totalInCents)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(sale.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewSale(sale)}>Ver</Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
