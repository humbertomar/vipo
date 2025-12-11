
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { formatCurrency } from '@/lib/utils';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    DollarSign,
    QrCode,
    Smartphone,
    User,
    Check,
    ChevronsUpDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    priceInCents: number;
    sku: string;
    images?: { url: string }[];
    variants?: { id: string; size: string; stock: number }[];
    totalStock: number;
}

interface CartItem extends Product {
    uniqueId: string; // for React keys
    quantity: number;
    variantId: string;
    size: string;
}

interface Customer {
    id: string;
    name: string;
    email: string;
}

export default function NewSale() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'POS_DEBIT' | 'POS_CREDIT' | 'PIX'>('CASH');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [_, setLocation] = useLocation();

    // Customer Selection
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [openCustomerCombo, setOpenCustomerCombo] = useState(false);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data.data || []))
            .catch(console.error);

        fetch('/api/users')
            .then(res => res.json())
            .then(data => setCustomers(data.data || data || []))
            .catch(console.error);
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product: Product, variantId: string, size: string) => {
        // Find if variant has stock
        const variant = product.variants?.find(v => v.id === variantId);
        if (!variant || variant.stock <= 0) {
            toast.error("Produto sem estoque nesta variação.");
            return;
        }

        const existingItem = cart.find(item => item.id === product.id && item.variantId === variantId);

        if (existingItem) {
            if (existingItem.quantity >= variant.stock) {
                toast.error("Estoque máximo atingido.");
                return;
            }
            setCart(cart.map(item =>
                (item.id === product.id && item.variantId === variantId)
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, uniqueId: Math.random().toString(), quantity: 1, variantId, size }]);
        }
    };

    const removeFromCart = (uniqueId: string) => {
        setCart(cart.filter(item => item.uniqueId !== uniqueId));
    };

    const updateQuantity = (uniqueId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.uniqueId === uniqueId) {
                const newQty = item.quantity + delta;
                if (newQty < 1) return item;
                // Check stock
                const originalProduct = products.find(p => p.id === item.id);
                const variant = originalProduct?.variants?.find(v => v.id === item.variantId);
                if (variant && newQty > variant.stock) {
                    toast.error("Estoque insuficiente.");
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((acc, item) => acc + (item.priceInCents * item.quantity), 0);

    const handleFinishSale = async () => {
        if (cart.length === 0) {
            toast.error("Carrinho vazio!");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                items: cart.map(item => ({
                    productId: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    priceInCents: item.priceInCents
                })),
                paymentMethod,
                type: 'POS',
                userId: selectedCustomerId
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Venda realizada com sucesso!");
                setCart([]);
                setLocation('/admin/vendas');
            } else {
                const err = await res.json();
                toast.error(`Erro ao finalizar: ${err.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro de conexão.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    return (
        <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Product Catalog (List View) */}
            <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar produtos (Nome ou SKU)..."
                            className="pl-9 bg-card"
                            autoFocus
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="flex-1 overflow-hidden flex flex-col">
                    <CardHeader className="py-4 px-6 border-b">
                        <CardTitle className="text-lg">Catálogo de Produtos</CardTitle>
                    </CardHeader>
                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Produto</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                    <TableHead>Preço</TableHead>
                                    <TableHead>Tamanhos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="h-12 w-12 bg-muted rounded-md overflow-hidden">
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Img</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-xs text-muted-foreground">{product.sku}</div>
                                        </TableCell>
                                        <TableCell className="font-bold whitespace-nowrap">
                                            {formatCurrency(product.priceInCents)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {product.variants?.map(v => (
                                                    <Button
                                                        key={v.id}
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={v.stock <= 0}
                                                        onClick={() => addToCart(product, v.id, v.size)}
                                                        className={`h-7 px-2 text-xs ${v.stock <= 0 ? 'opacity-50' : 'hover:border-primary hover:text-primary'}`}
                                                        title={`Estoque: ${v.stock}`}
                                                    >
                                                        {v.size}
                                                    </Button>
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* Right Col: Cart & Payment */}
            <div className="flex flex-col gap-4 h-full">
                {/* Customer Section */}
                <Card>
                    <CardHeader className="py-3 px-4 border-b">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <Popover open={openCustomerCombo} onOpenChange={setOpenCustomerCombo}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCustomerCombo}
                                    className="w-full justify-between"
                                >
                                    {selectedCustomer
                                        ? selectedCustomer.name
                                        : "Selecionar cliente..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar cliente..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {customers.map((customer) => (
                                                <CommandItem
                                                    key={customer.id}
                                                    value={customer.name}
                                                    onSelect={() => {
                                                        setSelectedCustomerId(customer.id === selectedCustomerId ? null : customer.id);
                                                        setOpenCustomerCombo(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {customer.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </CardContent>
                </Card>

                <Card className="flex-[2] flex flex-col overflow-hidden border-2 border-primary/10">
                    <CardHeader className="bg-muted/50 py-3 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Carrinho
                            </CardTitle>
                            <Badge variant="secondary">{cart.reduce((a, b) => a + b.quantity, 0)} itens</Badge>
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                                <ShoppingCart className="h-12 w-12" />
                                <p>Carrinho vazio</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div key={item.uniqueId} className="flex gap-3 items-start bg-card p-2 rounded-lg border shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Tam: {item.size} | {formatCurrency(item.priceInCents)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 bg-muted rounded-md border h-8">
                                                <button onClick={() => updateQuantity(item.uniqueId, -1)} className="px-2 hover:text-red-500 disabled:opacity-50" disabled={item.quantity <= 1}>
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.uniqueId, 1)} className="px-2 hover:text-green-500">
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                onClick={() => removeFromCart(item.uniqueId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                    <Separator />
                    <div className="p-4 bg-muted/20 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        {selectedCustomer && (
                            <div className="flex justify-between text-sm text-primary font-medium">
                                <span>Cliente</span>
                                <span>{selectedCustomer.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-2xl text-primary">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </Card>

                <Card className="flex-1">
                    <CardHeader className="py-3 px-4 border-b">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 grid grid-cols-2 gap-3">
                        <Button
                            variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                            className={`h-20 flex flex-col gap-2 ${paymentMethod === 'CASH' ? 'border-primary' : 'hover:border-primary/50'}`}
                            onClick={() => setPaymentMethod('CASH')}
                        >
                            <BanknoteIcon className="h-6 w-6" />
                            Dinheiro
                        </Button>
                        <Button
                            variant={paymentMethod === 'PIX' ? 'default' : 'outline'}
                            className={`h-20 flex flex-col gap-2 ${paymentMethod === 'PIX' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                            onClick={() => setPaymentMethod('PIX')}
                        >
                            <QrCode className="h-6 w-6" />
                            Pix
                        </Button>
                        <Button
                            variant={paymentMethod === 'POS_DEBIT' ? 'default' : 'outline'}
                            className={`h-20 flex flex-col gap-2 ${paymentMethod === 'POS_DEBIT' ? 'border-primary' : 'hover:border-primary/50'}`}
                            onClick={() => setPaymentMethod('POS_DEBIT')}
                        >
                            <Smartphone className="h-6 w-6" />
                            Débito
                        </Button>
                        <Button
                            variant={paymentMethod === 'POS_CREDIT' ? 'default' : 'outline'}
                            className={`h-20 flex flex-col gap-2 ${paymentMethod === 'POS_CREDIT' ? 'border-primary' : 'hover:border-primary/50'}`}
                            onClick={() => setPaymentMethod('POS_CREDIT')}
                        >
                            <CreditCard className="h-6 w-6" />
                            Crédito
                        </Button>
                    </CardContent>
                    <CardFooter className="px-4 pb-4">
                        <Button
                            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                            size="lg"
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={handleFinishSale}
                        >
                            {isSubmitting ? 'Processando...' : 'Finalizar Venda'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

function BanknoteIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="12" x="2" y="6" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
        </svg>
    )
}
