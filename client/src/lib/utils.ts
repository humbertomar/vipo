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
