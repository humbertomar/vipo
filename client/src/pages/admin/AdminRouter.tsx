
import { Route, Switch } from "wouter";
import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "./Dashboard";
import SalesList from "./sales/SalesList";
import NewSale from "./sales/NewSale";
import ProductsList from "./products/ProductsList";
import ProductForm from "./products/ProductForm";
import CategoriesList from "./categories/CategoriesList";
import CustomersList from "./customers/CustomersList";

export default function AdminRouter() {
    return (
        <AdminLayout>
            <Switch>
                {/* Sales */}
                <Route path="/vendas/nova" component={NewSale} />
                <Route path="/vendas" component={SalesList} />

                {/* Products */}
                <Route path="/produtos/novo" component={ProductForm} />
                <Route path="/produtos/:id/editar" component={ProductForm} />
                <Route path="/produtos" component={ProductsList} />

                {/* Categories */}
                <Route path="/categorias" component={CategoriesList} />

                {/* Customers */}
                <Route path="/clientes" component={CustomersList} />

                <Route path="/" component={Dashboard} />
                {/* Fallback to dashboard */}
                <Route component={Dashboard} />
            </Switch>
        </AdminLayout>
    );
}
