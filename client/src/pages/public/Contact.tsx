import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Página de Contato
 * Formulário de contato e informações de suporte
 */
export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Integrar com API de contato
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4 text-center">Fale Conosco</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Tem uma dúvida ou sugestão? Estamos aqui para ajudar. Entre em contato conosco através do formulário abaixo.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {success && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
                  ✓ Mensagem enviada com sucesso! Entraremos em contato em breve.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Assunto</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Assunto da mensagem"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mensagem</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Sua mensagem..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
                >
                  {loading ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Informações de Contato</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <a href="mailto:contato@vipo.com" className="text-primary hover:underline">
                    contato@vipo.com
                  </a>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">WhatsApp</p>
                  <a href="https://wa.me/5511982419124" className="text-primary hover:underline">
                    (62) 98241-9124
                  </a>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Horário de Atendimento</p>
                  <p className="text-sm">
                    Segunda a Sexta: 09:00 - 18:00<br />
                    Sábado: 09:00 - 14:00
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Redes Sociais</h3>
              
              <div className="space-y-2">
                <a href="#" className="block text-primary hover:underline">
                  Instagram @vipo
                </a>
                <a href="#" className="block text-primary hover:underline">
                  Facebook ViPO
                </a>
                <a href="#" className="block text-primary hover:underline">
                  TikTok @vipo
                </a>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">FAQ</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">Qual o prazo de entrega?</p>
                  <p className="text-muted-foreground">Entregamos em 3-7 dias úteis para São Paulo.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Posso devolver o produto?</p>
                  <p className="text-muted-foreground">Sim, temos 30 dias de garantia de satisfação.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

