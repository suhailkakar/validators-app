import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function formatTacAmount(amount: string | number): string {
  // All amounts from cosmosClient are now in utac, so always use the tokenConverter
  if (typeof amount === "string") {
    // Remove commas first
    const cleanAmount = amount.replace(/,/g, "");
    // Use tokenConverter to convert utac to TAC with proper formatting
    const { formatTacAmount: formatUtacAmount } = require("@/lib/tokenConverter");
    return formatUtacAmount(cleanAmount, 0); // No decimals, already has comma formatting
  }
  
  // Handle numeric amounts - assume these are already in TAC for legacy compatibility
  if (isNaN(amount)) {
    return "0";
  }
  
  // Round up to whole number using Math.ceil and add US-style comma formatting
  return Math.ceil(amount).toLocaleString('en-US');
}

// Helper function to format any number with US-style commas (for counts, etc.)
export function formatNumber(amount: string | number): string {
  if (typeof amount === "string") {
    const cleanAmount = amount.replace(/,/g, "");
    const numAmount = parseFloat(cleanAmount);
    if (isNaN(numAmount)) {
      return "0";
    }
    return Math.ceil(numAmount).toLocaleString('en-US');
  }
  
  if (isNaN(amount)) {
    return "0";
  }
  
  return Math.ceil(amount).toLocaleString('en-US');
}
