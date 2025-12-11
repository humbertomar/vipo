import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { toast } from "sonner";

/**
 * Layout de navegação principal
 */
function Header() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="font-bold text-2xl hover:opacity-80 transition-opacity">
            ViPO
          </a>
          <nav className="hidden md:flex gap-6">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <a href="/catalogo" className="hover:text-primary transition-colors">Catálogo</a>
            <a href="/contato" className="hover:text-primary transition-colors">Contato</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a href="/carrinho" className="relative hover:text-primary transition-colors">
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </div>
    </header>
  );
}

/**
 * Footer
 */
function Footer() {
  return (
    <footer className="border-t border-border bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">ViPO</h3>
            <p className="text-muted-foreground">
              Sungas com atitude para quem vive o impossível.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produtos</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/catalogo" className="hover:text-primary">Catálogo</a></li>
              <li><a href="/catalogo?category=sungas" className="hover:text-primary">Sungas</a></li>
              <li><a href="/catalogo?category=uniformes" className="hover:text-primary">Uniformes</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/contato" className="hover:text-primary">Contato</a></li>
              <li><a href="/contato" className="hover:text-primary">FAQ</a></li>
              <li><a href="/contato" className="hover:text-primary">Trocas e Devoluções</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Sobre</a></li>
              <li><a href="#" className="hover:text-primary">Blog</a></li>
              <li><a href="#" className="hover:text-primary">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 ViPO. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/catalogo"} component={Catalog} />
      <Route path={"/produto/:slug"} component={Product} />
      <Route path={"/carrinho"} component={Cart} />
      <Route path={"/contato"} component={Contact} />
      {/* Admin Routes - Flattened for stability */}
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
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <AdminAuthProvider>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Router />
                </main>
                <Footer />
                <Toaster />
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </AdminAuthProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;

