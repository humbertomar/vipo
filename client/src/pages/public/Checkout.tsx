import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Página de Checkout
 * Formulário de entrega, pagamento e confirmação
 */
export default function Checkout() {
  const [step, setStep] = useState(1);
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

  // TODO: Integrar com API de CEP (ViaCEP)
  const handleZipCodeChange = async (zipCode: string) => {
    if (zipCode.length === 8) {
      // const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
      // const data = await response.json();
      // setFormData(prev => ({
      //   ...prev,
      //   street: data.logradouro,
      //   neighborhood: data.bairro,
      //   city: data.localidade,
      //   state: data.uf,
      // }));
      console.log('TODO: Buscar CEP', zipCode);
    }
  };

  // TODO: Integrar com API de pagamento (Pagar.me ou Mercado Pago)
  const handleSubmitPayment = async () => {
    console.log('TODO: Processar pagamento', formData);
    alert('Pagamento em desenvolvimento - Integrar com Pagar.me ou Mercado Pago');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps */}
          <div className="lg:col-span-2">
            {/* Step 1: Dados Pessoais */}
            {step === 1 && (
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">1. Dados Pessoais</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Completo</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="João Silva"
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="joao@example.com"
                        className="w-full px-4 py-2 border border-border rounded-lg"
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
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 bg-primary text-primary-foreground"
                  onClick={() => setStep(2)}
                >
                  Continuar para Endereço
                </Button>
              </Card>
            )}

            {/* Step 2: Endereço */}
            {step === 2 && (
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">2. Endereço de Entrega</h2>
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
                      maxLength={8}
                      className="w-full px-4 py-2 border border-border rounded-lg"
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
                      className="w-full px-4 py-2 border border-border rounded-lg"
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
                        className="w-full px-4 py-2 border border-border rounded-lg"
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
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bairro</label>
                      <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        placeholder="Centro"
                        className="w-full px-4 py-2 border border-border rounded-lg"
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
                        className="w-full px-4 py-2 border border-border rounded-lg"
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
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground"
                    onClick={() => setStep(3)}
                  >
                    Continuar para Pagamento
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Pagamento */}
            {step === 3 && (
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">3. Pagamento</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome no Cartão</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="JOAO SILVA"
                      className="w-full px-4 py-2 border border-border rounded-lg"
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
                      className="w-full px-4 py-2 border border-border rounded-lg"
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
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-2 border border-border rounded-lg"
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
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Parcelamento</label>
                    <select
                      name="installments"
                      value={formData.installments}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    >
                      <option value={1}>À vista - R$ 299,99</option>
                      <option value={2}>2x de R$ 149,99</option>
                      <option value={3}>3x de R$ 99,99</option>
                      <option value={6}>6x de R$ 49,99</option>
                      <option value={12}>12x de R$ 24,99</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground"
                    onClick={handleSubmitPayment}
                  >
                    Confirmar Pedido
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span>Sunga ViPO Premium</span>
                  <span>R$ 299,99</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tamanho: M</span>
                  <span>Qtd: 1</span>
                </div>
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ 299,99</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>R$ 15,00</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Desconto:</span>
                  <span>-R$ 30,00</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>R$ 284,99</span>
              </div>

              <div className="mt-4 p-3 bg-secondary rounded-lg text-sm">
                <p className="font-semibold mb-1">Cupom VIPO10 aplicado</p>
                <p className="text-muted-foreground">Desconto de 10% em sua primeira compra</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

