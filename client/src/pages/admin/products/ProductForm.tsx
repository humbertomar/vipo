import { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from "sonner";
import { Link } from 'wouter';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function ProductForm() {
    const [match, params] = useRoute("/admin/produtos/:id/editar");
    const isEditing = !!match;
    const productId = params?.id;
    const [_, setLocation] = useLocation();

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Data sources
    const [categories, setCategories] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        categoryId: '',
        price: '', // in Reais (string for input)
        sku: '',
        totalStock: '0',
        isActive: true as boolean,
        isFeatured: false as boolean
    });

    const [variants, setVariants] = useState<any[]>([]);

    const [images, setImages] = useState<any[]>([]);

    // File upload refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadIndexRef = useRef<number | null>(null);

    useEffect(() => {
        fetchCategories();
        if (isEditing && productId) {
            fetchProduct(productId);
        }
    }, [productId, isEditing]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const fetchProduct = async (id: string) => {
        setLoadingData(true);
        try {
            const res = await fetch(`/api/products/${id}`);
            if (!res.ok) throw new Error('Product not found');
            const data = await res.json();
            const product = data.data || data; // Assuming response structure { data: product }

            setFormData({
                name: product.name,
                slug: product.slug,
                description: product.description || '',
                shortDescription: product.shortDescription || '',
                categoryId: product.categoryId,
                price: (product.priceInCents / 100).toFixed(2),
                sku: product.sku,
                totalStock: product.totalStock.toString(),
                isActive: product.isActive ?? true,
                isFeatured: product.isFeatured ?? false
            });

            if (product.variants) {
                setVariants(product.variants);
            }
            if (product.images) {
                setImages(product.images.sort((a: any, b: any) => a.order - b.order));
            }
        } catch (error) {
            toast.error("Erro ao carregar produto");
            setLocation('/admin/produtos');
        } finally {
            setLoadingData(false);
        }
    };

    const handlePriceChange = (value: string) => {
        // Allow only numbers and one comma/dot
        const cleanValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
        setFormData({ ...formData, price: cleanValue });
    };

    const formatCurrencyDisplay = (value: string) => {
        if (!value) return '';
        const number = parseFloat(value.replace(',', '.'));
        if (isNaN(number)) return value;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
    };

    // Variant Helpers
    const addVariant = () => {
        setVariants([...variants, { id: null, size: '', color: '', stock: 0, sku: '' }]);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    // Image Helpers
    const addImage = () => {
        if (images.length >= 6) {
            toast.error("Máximo de 6 imagens (1 Principal + 5 Extras)");
            return;
        }
        setImages([...images, { id: null, url: '', altText: '' }]);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const updateImage = (index: number, value: string) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], url: value };
        setImages(newImages);
    };

    const handleFileUpload = async (file: File, index: number) => {
        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading("Enviando imagem...");

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Falha no upload');

            const data = await res.json();

            updateImage(index, data.url);
            toast.success("Imagem enviada!", { id: toastId });

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar imagem", { id: toastId });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                priceInCents: Math.round(parseFloat(formData.price.replace(',', '.')) * 100),
                totalStock: parseInt(formData.totalStock),
                description: formData.description || null,
                shortDescription: formData.shortDescription || null,
                isActive: Boolean(formData.isActive),
                isFeatured: Boolean(formData.isFeatured),
                variants: variants.map(v => ({
                    id: v.id,
                    size: v.size,
                    color: v.color,
                    stock: v.stock,
                    sku: v.sku
                })),
                images: images.map((img, idx) => ({
                    id: img.id,
                    url: img.url,
                    order: idx
                }))
            };

            // Remove temporary 'price' field
            // @ts-ignore
            delete payload.price;

            const url = isEditing
                ? `/api/products/${productId}`
                : '/api/products';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error();

            toast.success(isEditing ? "Produto atualizado com sucesso" : "Produto criado com sucesso");
            setLocation('/admin/produtos');
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar produto");
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <div className="p-8 text-center">Carregando dados do produto...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/produtos">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditing ? 'Editar Produto' : 'Novo Produto'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && uploadIndexRef.current !== null) {
                            handleFileUpload(file, uploadIndexRef.current);
                        }
                    }}
                />

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Imagens do Produto</CardTitle>
                            <CardDescription>
                                Adicione até 6 imagens (1 Principal + 5 Extras).
                                Formato: .jpg, .png, .webp
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {images.map((img, index) => (
                                <div key={index} className="flex gap-4 items-center animate-in fade-in slide-in-from-top-2 border p-3 rounded-lg">
                                    <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center overflow-hidden border shrink-0 relative group">
                                        {img.url ? (
                                            <>
                                                <img
                                                    src={img.url}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement?.classList.add('bg-destructive/10');
                                                    }}
                                                />
                                            </>
                                        ) : (
                                            <Upload className="h-8 w-8 text-muted-foreground/50" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label className="font-medium">
                                            {index === 0 ? 'Imagem Principal' : `Imagem Extra ${index}`}
                                        </Label>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant={img.url ? "secondary" : "default"}
                                                    size="sm"
                                                    onClick={() => {
                                                        uploadIndexRef.current = index;
                                                        fileInputRef.current?.click();
                                                    }}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {img.url ? 'Trocar Imagem' : 'Carregar Imagem'}
                                                </Button>
                                                {img.url && (
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={img.url}>
                                                        {img.url.split('/').pop()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                Formatos suportados: JPG, PNG, WEBP, GIF
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeImage(index)}
                                        className="text-destructive hover:bg-destructive/10"
                                        title="Remover imagem"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            {images.length < 6 && (
                                <Button type="button" variant="outline" size="sm" onClick={addImage} className="w-full border-dashed">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Imagem
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                            <CardDescription>
                                Detalhes principais do produto.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Produto</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Ex: Camiseta Vipo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug (URL)</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                        placeholder="ex: camiseta-vipo-azul"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shortDescription">Descrição Curta</Label>
                                <Input
                                    id="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                    placeholder="Resumo breve do produto"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição Completa</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="min-h-[150px]"
                                    placeholder="Detalhes completos do produto..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preço e Estoque</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço (R$)</Label>
                                    <Input
                                        id="price"
                                        value={formData.price}
                                        onChange={(e) => handlePriceChange(e.target.value)}
                                        onBlur={(e) => {
                                            // Optional: format on blur
                                            // setFormData({...formData, price: e.target.value.replace('.', ',')}) 
                                        }}
                                        required
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Exibido: {formatCurrencyDisplay(formData.price)}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        required
                                        placeholder="PROD-001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalStock">Estoque Total</Label>
                                    <Input
                                        id="totalStock"
                                        type="number"
                                        value={formData.totalStock}
                                        onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Variações do Produto</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Variação
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {variants.length === 0 ? (
                                <div className="text-center text-muted-foreground py-4">
                                    Nenhuma variação adicionada.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tamanho</TableHead>
                                            <TableHead>Cor</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Estoque</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {variants.map((variant, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Input
                                                        value={variant.size}
                                                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                                        placeholder="Ex: P, M, G"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={variant.color}
                                                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                                        placeholder="Ex: Azul"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={variant.sku}
                                                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                        placeholder="Opcional"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Organização</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Categoria</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-4 mt-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => {
                                            setFormData(prev => ({ ...prev, isActive: checked }));
                                        }}
                                        disabled={loading || loadingData}
                                    />
                                    <Label 
                                        htmlFor="isActive" 
                                        className="cursor-pointer select-none"
                                    >
                                        Produto Ativo (Visível na loja)
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onCheckedChange={(checked) => {
                                            setFormData(prev => ({ ...prev, isFeatured: checked }));
                                        }}
                                        disabled={loading || loadingData}
                                    />
                                    <Label 
                                        htmlFor="isFeatured" 
                                        className="cursor-pointer select-none"
                                    >
                                        Destaque (Aparece na home)
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href="/admin/produtos">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Salvando...' : 'Salvar Produto'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
