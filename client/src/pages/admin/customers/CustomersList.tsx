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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

interface Address {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    isDefault: boolean;
}

interface Customer {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    customerProfile: {
        phone: string | null;
    } | null;
    addresses: Address[];
}

export default function CustomersList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

    // Form Stats
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            cep: '',
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: ''
        }
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setCustomers(data.data || data || []);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            const mainAddress = customer.addresses?.[0] || {
                cep: '',
                street: '',
                number: '',
                neighborhood: '',
                city: '',
                state: ''
            };

            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.customerProfile?.phone || '',
                address: {
                    cep: mainAddress.cep,
                    street: mainAddress.street,
                    number: mainAddress.number,
                    neighborhood: mainAddress.neighborhood,
                    city: mainAddress.city,
                    state: mainAddress.state
                }
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: {
                    cep: '',
                    street: '',
                    number: '',
                    neighborhood: '',
                    city: '',
                    state: ''
                }
            });
        }
        setIsModalOpen(true);
    };

    const handleAddressChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingCustomer ? `/api/users/${editingCustomer.id}` : '/api/users';
            const method = editingCustomer ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address.cep ? formData.address : undefined // Only send address if CEP is filled (rudimentary check)
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                alert(`Erro: ${err.message || 'Falha ao salvar'}`);
                return;
            }

            setIsModalOpen(false);
            fetchCustomers();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar cliente');
        }
    };

    const handleDeleteClick = (id: string) => {
        setCustomerToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!customerToDelete) return;
        try {
            const res = await fetch(`/api/users/${customerToDelete}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            fetchCustomers();
            setCustomerToDelete(null);
        } catch (error) {
            alert('Erro ao excluir cliente');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cliente
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Listagem de Clientes</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente..."
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
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Cidade/UF</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Carregando...</TableCell>
                                </TableRow>
                            ) : filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Nenhum cliente encontrado.</TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell>{customer.email}</TableCell>
                                        <TableCell>{customer.customerProfile?.phone || '-'}</TableCell>
                                        <TableCell>
                                            {customer.addresses?.[0] ? `${customer.addresses[0].city}/${customer.addresses[0].state}` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                                                {customer.isActive ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(customer)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(customer.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input
                                    id="cep"
                                    value={formData.address.cep}
                                    onChange={e => handleAddressChange('cep', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-4">Endereço Principal</h4>
                            <div className="grid grid-cols-6 gap-4">
                                <div className="col-span-4 grid gap-2">
                                    <Label htmlFor="street">Rua</Label>
                                    <Input
                                        id="street"
                                        value={formData.address.street}
                                        onChange={e => handleAddressChange('street', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2 grid gap-2">
                                    <Label htmlFor="number">Número</Label>
                                    <Input
                                        id="number"
                                        value={formData.address.number}
                                        onChange={e => handleAddressChange('number', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="neighborhood">Bairro</Label>
                                    <Input
                                        id="neighborhood"
                                        value={formData.address.neighborhood}
                                        onChange={e => handleAddressChange('neighborhood', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        value={formData.address.city}
                                        onChange={e => handleAddressChange('city', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="state">Estado</Label>
                                    <Input
                                        id="state"
                                        maxLength={2}
                                        value={formData.address.state}
                                        onChange={e => handleAddressChange('state', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                type="cliente"
                itemName={customerToDelete ? customers.find(c => c.id === customerToDelete)?.name : undefined}
            />
        </div>
    );
}
