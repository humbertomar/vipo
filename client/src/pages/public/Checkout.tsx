import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Check, ChevronLeft, ShoppingCart } from 'lucide-react';

/**
 * Página de Checkout Mobile-First
 * Multi-step com indicador de progresso, formulários responsivos e resumo adaptável
 */
export default function Checkout() {
  const [step, setStep] = useState(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Dados pessoais
    fullName: '',
    email: '',
    phone: '',

    // Endereço
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',

    // Pagamento
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    installments: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleZipCodeChange = async (zipCode: string) => {
    if (zipCode.length === 8) {
      console.log('TODO: Buscar CEP', zipCode);
      // Integração com ViaCEP aqui
    }
  };

  const handleSubmitPayment = async () => {
    console.log('TODO: Processar pagamento', formData);
    alert('Pagamento em desenvolvimento - Integrar com Pagar.me ou Mercado Pago');
  };

  const steps = [
    { number: 1, title: 'Dados', shortTitle: 'Dados' },
    { number: 2, title: 'Endereço', shortTitle: 'Endereço' },
    { number: 3, title: 'Pagamento', shortTitle: 'Pagar' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Checkout</h1>

          {/* Botão Ver Resumo Mobile */}
          <div className="lg:hidden">
            <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="touch-target">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Resumo
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Resumo do Pedido</SheetTitle>
                </SheetHeader>
                <OrderSummary />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Progress Indicator - Mobile & Desktop */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-all ${step > s.number
                        ? 'bg-green-500 text-white'
                        : step === s.number
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {step > s.number ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : s.number}
                  </div>
                  <span
                    className={`text-xs sm:text-sm mt-2 font-medium ${step >= s.number ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                  >
                    <span className="hidden sm:inline">{s.title}</span>
                    <span className="sm:hidden">{s.shortTitle}</span>
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all ${step > s.number ? 'bg-green-500' : 'bg-muted'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Forms */}
          <div className="lg:col-span-2">
            {/* Step 1: Dados Pessoais */}
            {step === 1 && (
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">1. Dados Pessoais</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Completo</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="João Silva"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="joao@example.com"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(62) 98241-9124"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 py-6 sm:py-7 text-base sm:text-lg font-semibold bg-primary text-primary-foreground touch-target"
                  onClick={() => setStep(2)}
                >
                  Continuar para Endereço
                </Button>
              </Card>
            )}

            {/* Step 2: Endereço */}
            {step === 2 && (
              <Card className="p-4 sm:p-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center text-primary hover:underline mb-4 text-sm sm:text-base"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </button>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">2. Endereço de Entrega</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">CEP</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => {
                        handleInputChange(e);
                        handleZipCodeChange(e.target.value);
                      }}
                      placeholder="12345-678"
                      maxLength={9}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rua</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Rua Principal"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Número</label>
                      <input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Complemento</label>
                      <input
                        type="text"
                        name="complement"
                        value={formData.complement}
                        onChange={handleInputChange}
                        placeholder="Apto 45"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bairro</label>
                      <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        placeholder="Centro"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cidade</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="São Paulo"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Estado</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="SP"
                      maxLength={2}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base uppercase"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 py-6 sm:py-7 text-base touch-target order-2 sm:order-1"
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 py-6 sm:py-7 text-base sm:text-lg font-semibold bg-primary text-primary-foreground touch-target order-1 sm:order-2"
                    onClick={() => setStep(3)}
                  >
                    Continuar para Pagamento
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Pagamento */}
            {step === 3 && (
              <Card className="p-4 sm:p-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center text-primary hover:underline mb-4 text-sm sm:text-base"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </button>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">3. Pagamento</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome no Cartão</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="JOAO SILVA"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Número do Cartão</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Validade</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        name="cardCVV"
                        value={formData.cardCVV}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Parcelamento</label>
                    <select
                      name="installments"
                      value={formData.installments}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg text-base"
                    >
                      <option value={1}>À vista - R$ 299,99</option>
                      <option value={2}>2x de R$ 149,99</option>
                      <option value={3}>3x de R$ 99,99</option>
                      <option value={6}>6x de R$ 49,99</option>
                      <option value={12}>12x de R$ 24,99</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 py-6 sm:py-7 text-base touch-target order-2 sm:order-1"
                    onClick={() => setStep(2)}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 py-6 sm:py-7 text-base sm:text-lg font-semibold bg-green-600 text-white hover:bg-green-700 touch-target order-1 sm:order-2"
                    onClick={handleSubmitPayment}
                  >
                    🔒 Confirmar Pedido
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary - Desktop Only (Sticky) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Resumo Reutilizável
function OrderSummary() {
  return (
    <Card className="p-4 sm:p-6">
      <h2 className="font-bold text-base sm:text-lg mb-4">Resumo do Pedido</h2>

      <div className="space-y-3 mb-4 pb-4 border-b border-border">
        <div className="flex justify-between">
          <span className="text-sm sm:text-base">Sunga ViPO Premium</span>
          <span className="text-sm sm:text-base font-semibold">R$ 299,99</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>Tamanho: M</span>
          <span>Qtd: 1</span>
        </div>
      </div>

      <div className="space-y-2 mb-4 pb-4 border-b border-border text-sm sm:text-base">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>R$ 299,99</span>
        </div>
        <div className="flex justify-between">
          <span>Frete:</span>
          <span>R$ 15,00</span>
        </div>
        <div className="flex justify-between text-green-600 font-medium">
          <span>Desconto:</span>
          <span>-R$ 30,00</span>
        </div>
      </div>

      <div className="flex justify-between font-bold text-base sm:text-lg mb-4">
        <span>Total:</span>
        <span>R$ 284,99</span>
      </div>

      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm">
        <p className="font-semibold text-green-700 mb-1">✓ Cupom VIPO10 aplicado</p>
        <p className="text-green-600">Desconto de 10% em sua primeira compra</p>
      </div>
    </Card>
  );
}
