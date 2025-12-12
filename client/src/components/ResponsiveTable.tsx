import { ReactNode } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface Column<T> {
    key: string;
    label: string;
    render: (item: T) => ReactNode;
    hideOnMobile?: boolean; // Opcional: esconder coluna específica no mobile
}

interface ResponsiveTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    loading?: boolean;
    emptyMessage?: string;
    mobileCardRender?: (item: T) => ReactNode; // Render customizado para cards mobile
}

/**
 * ResponsiveTable Component
 * 
 * Tabela responsiva que se transforma em cards no mobile
 * Reutilizável em todas as páginas admin
 * 
 * @param data - Array de dados a serem exibidos
 * @param columns - Definição das colunas
 * @param keyExtractor - Função para extrair key única de cada item
 * @param loading - Estado de carregamento
 * @param emptyMessage - Mensagem quando não há dados
 * @param mobileCardRender - Render customizado para versão mobile (opcional)
 */
export function ResponsiveTable<T>({
    data,
    columns,
    keyExtractor,
    loading = false,
    emptyMessage = 'Nenhum item encontrado.',
    mobileCardRender
}: ResponsiveTableProps<T>) {

    if (loading) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Carregando...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (
        <>
            {/* Desktop: Tabela tradicional */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key}>{col.label}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={keyExtractor(item)}>
                                {columns.map((col) => (
                                    <TableCell key={col.key}>
                                        {col.render(item)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile: Cards */}
            <div className="md:hidden space-y-4">
                {data.map((item) => (
                    <Card key={keyExtractor(item)} className="p-4">
                        {mobileCardRender ? (
                            mobileCardRender(item)
                        ) : (
                            <div className="space-y-3">
                                {columns
                                    .filter((col) => !col.hideOnMobile)
                                    .map((col) => (
                                        <div key={col.key} className="flex justify-between items-start gap-2">
                                            <span className="text-sm font-medium text-muted-foreground min-w-[80px]">
                                                {col.label}:
                                            </span>
                                            <div className="flex-1 text-sm text-right">
                                                {col.render(item)}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </>
    );
}
