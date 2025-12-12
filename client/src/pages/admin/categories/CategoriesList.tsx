import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ResponsiveTable } from '@/components/ResponsiveTable';

export default function CategoriesList() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', isActive: true });
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
            toast.error("Erro ao carregar categorias");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            isActive: category.isActive
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({ name: '', slug: '', isActive: true });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setCategoryToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        try {
            const res = await fetch(`/api/categories/${categoryToDelete}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success("Categoria excluída com sucesso");
            fetchCategories();
            setCategoryToDelete(null);
        } catch (error) {
            toast.error("Erro ao excluir categoria");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editingCategory
                ? `/api/categories/${editingCategory.id}`
                : '/api/categories';

            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error();

            toast.success(editingCategory ? "Categoria atualizada" : "Categoria criada");
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error("Erro ao salvar categoria");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Categorias</h1>
                <Button onClick={handleCreate} className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 w-full sm:w-auto touch-target">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Listagem de Categorias</CardTitle>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar categoria..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveTable
                        data={filteredCategories}
                        columns={[
                            {
                                key: 'name',
                                label: 'Nome',
                                render: (category) => <span className="font-medium">{category.name}</span>
                            },
                            {
                                key: 'slug',
                                label: 'Slug',
                                render: (category) => <span className="text-sm text-muted-foreground">{category.slug}</span>,
                                hideOnMobile: true
                            },
                            {
                                key: 'products',
                                label: 'Produtos',
                                render: (category) => <span>{category._count?.products || 0}</span>
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (category) => (
                                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                                        {category.isActive ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                )
                            },
                            {
                                key: 'actions',
                                label: 'Ações',
                                render: (category) => (
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 touch-target"
                                            onClick={() => handleEdit(category)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 touch-target"
                                            onClick={() => handleDeleteClick(category.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            }
                        ]}
                        keyExtractor={(category) => category.id}
                        loading={loading}
                        emptyMessage="Nenhuma categoria encontrada."
                    />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-full sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="isActive">Ativo</Label>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
                            <Button type="submit" disabled={isSaving} className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/30 w-full sm:w-auto">{isSaving ? 'Salvando...' : 'Salvar'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                type="categoria"
                itemName={categoryToDelete ? categories.find(c => c.id === categoryToDelete)?.name : undefined}
            />
        </div>
    );
}
