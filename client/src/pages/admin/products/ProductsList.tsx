import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from "sonner";
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { ResponsiveTable } from '@/components/ResponsiveTable';

export default function ProductsList() {
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [_, setLocation] = useLocation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        setLoading(true);
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }

    const handleDeleteClick = (id: string) => {
        setProductToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            const res = await fetch(`/api/products/${productToDelete}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                const errorMessage = data.message || data.error || "Erro ao excluir produto";
                toast.error(errorMessage);
                return;
            }

            toast.success("Produto excluído com sucesso");
            fetchProducts();
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        } catch (error) {
            toast.error("Erro ao excluir produto. Tente novamente.");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produtos</h1>
                <Button size="lg" onClick={() => setLocation('/admin/produtos/novo')} className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all font-semibold w-full sm:w-auto touch-target">
                    <Plus className="mr-2 h-5 w-5" />
                    Novo Produto
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Listagem de Produtos</CardTitle>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar produto..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveTable
                        data={filteredProducts}
                        columns={[
                            {
                                key: 'image',
                                label: 'Imagem',
                                render: (product) => (
                                    <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                        {product.images && product.images[0] ? (
                                            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Img</span>
                                        )}
                                    </div>
                                ),
                                hideOnMobile: true
                            },
                            {
                                key: 'name',
                                label: 'Nome',
                                render: (product) => <span className="font-medium">{product.name}</span>
                            },
                            {
                                key: 'sku',
                                label: 'SKU',
                                render: (product) => <span className="text-sm">{product.sku}</span>,
                                hideOnMobile: true
                            },
                            {
                                key: 'stock',
                                label: 'Estoque',
                                render: (product) => <span>{product.totalStock}</span>
                            },
                            {
                                key: 'price',
                                label: 'Preço',
                                render: (product) => <span className="font-semibold">{formatCurrency(product.priceInCents)}</span>
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (product) => (
                                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                        {product.isActive ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                ),
                                hideOnMobile: true
                            },
                            {
                                key: 'actions',
                                label: 'Ações',
                                render: (product) => (
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 touch-target"
                                            onClick={() => setLocation(`/admin/produtos/${product.id}/editar`)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 touch-target"
                                            onClick={() => handleDeleteClick(product.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            }
                        ]}
                        keyExtractor={(product) => product.id}
                        loading={loading}
                        emptyMessage="Nenhum produto encontrado."
                    />
                </CardContent>
            </Card>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                type="produto"
                itemName={productToDelete ? products.find(p => p.id === productToDelete)?.name : undefined}
            />
        </div>
    );
}
