import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor em centavos para formato brasileiro (BRL)
 * @param cents - Valor em centavos
 * @returns String formatada como "R$ 100,00"
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/**
 * Formata um valor decimal para formato brasileiro (BRL)
 * @param value - Valor decimal (já em reais)
 * @returns String formatada como "R$ 100,00"
 */
export function formatCurrencyDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata um número de telefone para o formato brasileiro
 * @param phone - Número de telefone (apenas dígitos ou já formatado)
 * @returns String formatada como "(62) 98419-8531"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove tudo exceto números
  const numbers = phone.replace(/\D/g, '');
  
  // Formata baseado no tamanho
  if (numbers.length === 10) {
    // Telefone fixo: (62) 1234-5678
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length === 11) {
    // Celular: (62) 98419-8531
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  // Se não tiver tamanho válido, retorna o original
  return phone;
}

/**
 * Aplica máscara de telefone durante a digitação
 * @param value - Valor digitado
 * @returns Valor formatado
 */
export function maskPhone(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica formatação
  if (limited.length <= 2) {
    return limited.length > 0 ? `(${limited}` : '';
  } else if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }
}
