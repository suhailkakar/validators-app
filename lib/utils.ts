import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function formatTacAmount(amount: string | number): string {
  // Handle string amounts that could be raw utac (very large) or formatted TAC
  if (typeof amount === "string") {
    // Remove commas first
    const cleanAmount = amount.replace(/,/g, "");
    
    // If it's a very large number (more than 15 digits), treat as raw utac
    if (cleanAmount.length > 15) {
      // Import the proper tokenConverter function for utac handling
      const { formatTacAmount: formatUtacAmount } = require("@/lib/tokenConverter");
      return formatUtacAmount(cleanAmount, 1);
    }
    
    // Otherwise treat as already formatted TAC amount
    const numAmount = parseFloat(cleanAmount);
    if (isNaN(numAmount)) {
      return "0";
    }
    return numAmount.toFixed(1);
  }
  
  // Handle numeric amounts
  if (isNaN(amount)) {
    return "0";
  }
  
  return amount.toFixed(1);
}
