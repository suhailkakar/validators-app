"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconDownload } from "@tabler/icons-react";

export function ReportsExport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconDownload className="h-5 w-5" />
          Reports & Export
        </CardTitle>
        <CardDescription>
          Export wallet data to CSV, Excel, or JSON
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Export to CSV</h4>
              <p className="text-sm text-muted-foreground">
                Export wallet data to CSV
              </p>
            </div>
            <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
              Export .csv
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Export to PDF</h4>
              <p className="text-sm text-muted-foreground">
                Export wallet data to PDF
              </p>
            </div>
            <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
              Export .pdf
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Export to Excel</h4>
              <p className="text-sm text-muted-foreground">
                Export wallet data to Excel
              </p>
            </div>
            <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
              Export .xlsx
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
