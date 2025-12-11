import { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { toast } from 'sonner';

export default function OrderDetailsPage() {
    const [match, params] = useRoute("/admin/vendas/:id");
    const id = params?.id;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [_, setLocation] = useLocation();

    useEffect(() => {
        if (id) {
            fetchOrder(id);
        }
    }, [id]);

    const fetchOrder = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (!res.ok) throw new Error('Order not found');
            const data = await res.json();
            setOrder(data.data || data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success("Venda excluída com sucesso");
            setLocation('/admin/vendas');
        } catch (error) {
            toast.error("Erro ao excluir venda");
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Carregando detalhes do pedido...</div>;
    }

    if (!order) {
        return (
            <div className="p-8 text-center space-y-4">
                <p>Pedido não encontrado.</p>
                <Link href="/admin/vendas">
                    <Button variant="outline">Voltar para Vendas</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/vendas">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Pedido #{order.orderNumber || order.id?.substring(0, 8) || 'N/A'}
                    </h1>
                    <p className="text-muted-foreground">
                        Realizado em {new Date(order.createdAt).toLocaleString()}
                    </p>
                </div>
                <Badge className="text-lg px-4 py-1" variant={order.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                    {order.status === 'CONFIRMED' ? 'Confirmado' : order.status}
                </Badge>
                <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Venda
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Itens do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Variação</TableHead>
                                    <TableHead className="text-center">Qtd</TableHead>
                                    <TableHead className="text-right">Preço Unit.</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items?.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.product?.name || 'Produto Removido'}</TableCell>
                                        <TableCell>{item.variant?.size || '-'}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.priceInCents)}</TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(item.priceInCents * item.quantity)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-end mt-6 pt-4 border-t">
                            <div className="text-right space-y-1">
                                <p className="text-sm text-muted-foreground">Subtotal</p>
                                <p className="text-2xl font-bold">{formatCurrency(order.totalInCents)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-medium text-lg">{order.user?.name || 'Cliente Balcão'}</p>
                            <p className="text-muted-foreground">{order.user?.email || '-'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pagamento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Método</p>
                                <Badge variant="outline" className="uppercase">
                                    {order.payment?.method || order.paymentMethod || 'N/A'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Status</p>
                                <span className="font-medium capitalize">
                                    {order.payment?.status?.toLowerCase() || 'Pendente'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                type="venda"
                itemName={order ? `Pedido #${order.orderNumber || order.id?.substring(0, 8) || 'N/A'}` : undefined}
            />
        </div>
    );
}
