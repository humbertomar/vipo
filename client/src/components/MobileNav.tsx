import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface MobileNavProps {
    children: React.ReactNode;
    triggerClassName?: string;
}

/**
 * MobileNav Component
 * 
 * Componente de navegação mobile reutilizável com Sheet/Drawer
 * Usado tanto no header público quanto no admin sidebar
 * 
 * @param children - Conteúdo do menu (links, navegação)
 * @param triggerClassName - Classes CSS customizadas para o botão trigger
 */
export function MobileNav({ children, triggerClassName = '' }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`md:hidden touch-target ${triggerClassName}`}
                    aria-label="Abrir menu"
                >
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <nav
                    className="flex flex-col gap-4 mt-8"
                    onClick={(e) => {
                        // Fecha o menu se clicar em um link
                        if ((e.target as HTMLElement).closest('a')) {
                            setOpen(false);
                        }
                    }}
                >
                    {children}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
