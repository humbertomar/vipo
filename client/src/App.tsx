import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileNav } from "@/components/MobileNav";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/public/Home";
import Catalog from "@/pages/public/Catalog";
import Product from "@/pages/public/Product";
import Cart from "@/pages/public/Cart";
import Contact from "@/pages/public/Contact";
import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import SalesList from "@/pages/admin/sales/SalesList";
import OrderDetailsPage from "@/pages/admin/sales/OrderDetailsPage";
import NewSale from "@/pages/admin/sales/NewSale";
import ProductsList from "@/pages/admin/products/ProductsList";
import CustomersList from "@/pages/admin/customers/CustomersList";
import Settings from "@/pages/admin/settings/Settings";
import ProductFormPage from "@/pages/admin/products/ProductFormPage";
import CategoriesList from "@/pages/admin/categories/CategoriesList";
import Checkout from "@/pages/public/Checkout";
import AdminLogin from "@/pages/admin/AdminLogin";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";

/**
 * Layout de navegação principal (só para rotas públicas)
 */
import { Home as HomeIcon, ShoppingBag, Phone, ShoppingCart } from 'lucide-react';

/**
 * Layout de navegação principal (só para rotas públicas)
 */
function Header() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo e Menu Mobile */}
        <div className="flex items-center gap-3">
          {/* Mobile Nav */}
          <div className="md:hidden">
            <MobileNav>
              <div className="flex flex-col h-full">
                <div className="px-2 mb-8">
                  <span className="font-bold text-2xl tracking-tight">ViPO</span>
                  <p className="text-xs text-muted-foreground mt-1">Sungas & Uniformes</p>
                </div>

                <div className="space-y-2 flex-1">
                  <a
                    href="/"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-lg font-medium hover:bg-secondary hover:text-foreground transition-all group"
                  >
                    <HomeIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    Home
                  </a>
                  <a
                    href="/catalogo"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-lg font-medium hover:bg-secondary hover:text-foreground transition-all group"
                  >
                    <ShoppingBag className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    Catálogo
                  </a>
                  <a
                    href="/contato"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-lg font-medium hover:bg-secondary hover:text-foreground transition-all group"
                  >
                    <Phone className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    Contato
                  </a>
                </div>

                <div className="mt-auto px-2 pt-6 border-t border-border">
                  <a href="/carrinho" className="flex items-center gap-3 px-3 py-3 rounded-lg text-lg font-medium bg-secondary/50 hover:bg-secondary transition-all">
                    <ShoppingCart className="w-5 h-5" />
                    Carrinho ({cartCount})
                  </a>
                </div>
              </div>
            </MobileNav>
          </div>

          <a href="/" className="font-bold text-2xl hover:opacity-80 transition-opacity tracking-tight">
            ViPO
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
          <a href="/catalogo" className="text-sm font-medium hover:text-primary transition-colors">Catálogo</a>
          <a href="/contato" className="text-sm font-medium hover:text-primary transition-colors">Contato</a>
        </nav>

        {/* Cart */}
        <a href="/carrinho" className="relative p-2 hover:bg-secondary rounded-full transition-colors group">
          <ShoppingCart className="w-6 h-6 text-foreground group-hover:scale-105 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-background">
              {cartCount}
            </span>
          )}
        </a>
      </div>
    </header>
  );
}

/**
 * Footer (só para rotas públicas)
 */
function Footer() {
  return (
    <footer className="border-t border-border bg-secondary py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Grid responsivo: 1 col mobile, 2 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h3 className="font-bold text-lg mb-3 sm:mb-4">ViPO</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Sungas com atitude para quem vive o impossível.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4">Produtos</h4>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <li><a href="/catalogo" className="hover:text-primary transition-colors">Catálogo</a></li>
              <li><a href="/catalogo?category=sungas" className="hover:text-primary transition-colors">Sungas</a></li>
              <li><a href="/catalogo?category=uniformes" className="hover:text-primary transition-colors">Uniformes</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <li><a href="/contato" className="hover:text-primary transition-colors">Contato</a></li>
              <li><a href="/contato" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="/contato" className="hover:text-primary transition-colors">Trocas e Devoluções</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Sobre</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 sm:pt-8 text-center text-sm sm:text-base text-muted-foreground">
          <p>&copy; 2025 ViPO. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  if (isAdminRoute) {
    // Rotas admin - SEM Header/Footer
    return (
      <Switch>
        <Route path="/admin/login">
          <AdminLogin />
        </Route>
        <Route path="/admin">
          <AdminLayout><Dashboard /></AdminLayout>
        </Route>
        <Route path="/admin/vendas">
          <AdminLayout><SalesList /></AdminLayout>
        </Route>
        <Route path="/admin/vendas/nova">
          <AdminLayout><NewSale /></AdminLayout>
        </Route>
        <Route path="/admin/vendas/:id">
          <AdminLayout><OrderDetailsPage /></AdminLayout>
        </Route>
        <Route path="/admin/produtos">
          <AdminLayout><ProductsList /></AdminLayout>
        </Route>
        <Route path="/admin/produtos/novo">
          <AdminLayout><ProductFormPage /></AdminLayout>
        </Route>
        <Route path="/admin/produtos/:id/editar">
          <AdminLayout><ProductFormPage /></AdminLayout>
        </Route>
        <Route path="/admin/categorias">
          <AdminLayout><CategoriesList /></AdminLayout>
        </Route>
        <Route path="/admin/clientes">
          <AdminLayout><CustomersList /></AdminLayout>
        </Route>
        <Route path="/admin/configuracoes">
          <AdminLayout><Settings /></AdminLayout>
        </Route>
      </Switch>
    );
  }

  // Rotas públicas - COM Header/Footer
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/catalogo"} component={Catalog} />
          <Route path={"/produto/:slug"} component={Product} />
          <Route path={"/carrinho"} component={Cart} />
          <Route path={"/contato"} component={Contact} />
          <Route path={"/checkout"} component={Checkout} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <AdminAuthProvider>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AdminAuthProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
