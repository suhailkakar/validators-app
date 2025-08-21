import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function formatTacAmount(amount: string | number): string {
  const numAmount =
    typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  return numAmount.toFixed(1);
}
