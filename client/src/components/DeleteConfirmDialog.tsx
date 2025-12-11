import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    itemName?: string;
    type?: 'cliente' | 'categoria' | 'produto' | 'venda' | 'item';
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    itemName,
    type = 'item'
}: DeleteConfirmDialogProps) {
    const defaultTitles = {
        cliente: 'Excluir Cliente',
        categoria: 'Excluir Categoria',
        produto: 'Excluir Produto',
        venda: 'Excluir Venda',
    };

    const defaultDescriptions = {
        cliente: 'Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.',
        categoria: 'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.',
        produto: 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
        venda: 'Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.',
    };

    const finalTitle = title || (type !== 'item' ? defaultTitles[type] : undefined) || 'Confirmar Exclusão';
    const baseDescription = description || (type !== 'item' ? defaultDescriptions[type] : 'Esta ação não pode ser desfeita.');
    const finalDescription = itemName 
        ? `${baseDescription}\n\nItem: ${itemName}`
        : baseDescription;

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{finalTitle}</AlertDialogTitle>
                    <AlertDialogDescription className="whitespace-pre-line">
                        {finalDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

