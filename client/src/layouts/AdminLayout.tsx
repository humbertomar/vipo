
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Settings,
    Menu,
    X,
    Store,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLogin from '@/pages/admin/AdminLogin';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [location, setLocation] = useLocation();
    const { isAuthenticated, logout } = useAdminAuth();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Vendas', href: '/admin/vendas', icon: ShoppingBag },
        { name: 'Produtos', href: '/admin/produtos', icon: Package },
        { name: 'Categorias', href: '/admin/categorias', icon: Menu },
        { name: 'Clientes', href: '/admin/clientes', icon: Users },
        { name: 'Catálogo', href: '/catalogo', icon: Store },
    ];

    const settingsNav = [
        { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
    };

    // Se não estiver autenticado, redireciona para login
    if (!isAuthenticated) {
        if (location !== '/admin/login') {
            setLocation('/admin/login');
        }
        return <AdminLogin />;
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-200 transform lg:translate-x-0 flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <Link href="/admin">
                        <div className="flex items-center gap-2 font-bold text-xl text-primary cursor-pointer">
                            <Store className="h-6 w-6" />
                            <span>ViPO Admin</span>
                        </div>
                    </Link>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1 flex flex-col">
                    <div className="flex-1 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location === item.href;
                            const isExternal = item.href === '/catalogo';

                            if (isExternal) {
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <div className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                                            "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}>
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                        </div>
                                    </a>
                                );
                            }

                            return (
                                <Link key={item.name} href={item.href}>
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    <div className="pt-4 border-t border-border space-y-1">
                        {settingsNav.map((item) => {
                            const isActive = location === item.href;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t border-border">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="h-14 sm:h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 flex items-center justify-between px-3 sm:px-4 lg:px-8">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        {/* Notifications or Profile dropdown could go here */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Admin</span>
                            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm sm:text-base">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
            <Toaster />
        </div>
    );
}
