
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Geral</CardTitle>
                        <CardDescription>Informações básicas da loja</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="store-name">Nome da Loja</Label>
                            <Input id="store-name" defaultValue="ViPO Futevôlei" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="support-email">Email de Suporte</Label>
                            <Input id="support-email" defaultValue="contato@vipo.com.br" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pagamentos</CardTitle>
                        <CardDescription>Configurações de chaves e métodos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Aceitar PIX</Label>
                                <p className="text-sm text-muted-foreground">Habilitar pagamentos via PIX no checkout</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="grid gap-2">
                            <Label>Chave PIX (Padrão)</Label>
                            <Input defaultValue="12.345.678/0001-90" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button>Salvar Alterações</Button>
                </div>
            </div>
        </div>
    );
}
