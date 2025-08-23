"use client";

import * as React from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

interface ExportButtonProps {
  selectedPeriod: string;
}

export function ExportButton({ selectedPeriod }: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const data = await apiClient.getValidators(selectedPeriod);

      const headers = [
        "Address",
        "Moniker",
        "Status",
        "Active",
        "Commission Rate",
        "Outstanding Rewards (TAC)",
        "Unclaimed Commission (TAC)",
        "Claimed Commission (TAC)",
        "Total Commission (TAC)",
        "Total Rewards (TAC)",
        "Burn Amount (TAC)",
        "Validator Keeps (TAC)",
        "Should Burn",
        "Has Commission Issues",
        "Calculated At",
      ];

      const csvContent = [
        headers.join(","),
        ...data.validators.map((validator) =>
          [
            `"${validator.address}"`,
            `"${validator.moniker}"`,
            `"${validator.status}"`,
            validator.isActive ? "Yes" : "No",
            `"${validator.commissionRate}"`,
            `"${validator.outstandingRewards}"`,
            `"${validator.unclaimedCommission}"`,
            `"${validator.claimedCommission}"`,
            `"${validator.totalCommission}"`,
            `"${validator.totalRewards}"`,
            `"${validator.burnAmount}"`,
            `"${validator.validatorKeeps}"`,
            validator.shouldBurn ? "Yes" : "No",
            validator.hasCommissionIssues ? "Yes" : "No",
            `"${new Date(validator.calculatedAt).toLocaleString()}"`,
          ].join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `tac-validators-${selectedPeriod}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Validator data exported to CSV for ${selectedPeriod}`);
    } catch (error) {
      console.error("Failed to export CSV:", error);
      toast.error("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const data = await apiClient.getValidators(selectedPeriod);

      // Create a simple HTML table for PDF generation
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>TAC Validators Report - ${selectedPeriod}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; font-size: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .status-active { color: #28a745; font-weight: bold; }
            .status-inactive { color: #dc3545; }
            .burn-amount { font-weight: bold; color: #fd7e14; }
          </style>
        </head>
        <body>
          <h1>TAC Validators Burn Report - ${selectedPeriod}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Moniker</th>
                <th>Status</th>
                <th>Commission Rate</th>
                <th>Total Commission (TAC)</th>
                <th>Burn Amount (TAC)</th>
                <th>Validator Keeps (TAC)</th>
                <th>Should Burn</th>
              </tr>
            </thead>
            <tbody>
              ${data.validators
                .map(
                  (validator) => `
                <tr>
                  <td>${validator.moniker}</td>
                  <td class="${
                    validator.isActive ? "status-active" : "status-inactive"
                  }">
                    ${validator.isActive ? "Active" : "Inactive"}
                  </td>
                  <td>${validator.commissionRate}</td>
                  <td>${validator.totalCommission}</td>
                  <td class="burn-amount">${validator.burnAmount}</td>
                  <td>${validator.validatorKeeps}</td>
                  <td>${validator.shouldBurn ? "Yes" : "No"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Open in new window for printing/PDF save
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();

        // Trigger print dialog after content loads
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      toast.success(
        `Print dialog opened for ${selectedPeriod} report. Use your browser's print function to save as PDF.`
      );
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
