import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from "sonner";
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { formatCurrency } from '@/lib/utils';

export default function ProductsList() {
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [_, setLocation] = useLocation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data.data || []))
            .catch(console.error);
    }

    const handleDeleteClick = (id: string) => {
        setProductToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            const res = await fetch(`/api/products/${productToDelete}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success("Produto excluído com sucesso");
            fetchProducts();
            setProductToDelete(null);
        } catch (error) {
            toast.error("Erro ao excluir produto");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
                <Button onClick={() => setLocation('/admin/produtos/novo')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Listagem de Produtos</CardTitle>
                        <div className="relative w-64">
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Imagem</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Estoque</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                            {product.images && product.images[0] ? (
                                                <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Img</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell>{product.totalStock}</TableCell>
                                    <TableCell>{formatCurrency(product.priceInCents)}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                            {product.isActive ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLocation(`/admin/produtos/${product.id}/editar`)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
