"use client";

import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconSearch,
  IconFilter,
  IconDownload,
  IconSortAscending,
  IconSortDescending,
  IconArrowsSort,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTacAmount } from "@/lib/utils";
import { usePeriod } from "@/contexts/period-context";

export const schema = z.object({
  address: z.string(),
  moniker: z.string(),
  status: z.string(),
  isActive: z.boolean(),
  commissionRate: z.string(),
  burnAmount: z.string(),
  totalCommission: z.string(),
  shouldBurn: z.boolean(),
  hasCommissionIssues: z.boolean(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "moniker",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Validator
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.moniker}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {row.original.address.slice(0, 20)}...
          </span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Status
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    filterFn: (row, id, value) => {
      if (value === "active") return row.original.isActive;
      if (value === "inactive") return !row.original.isActive;
      if (value === "issues") return row.original.hasCommissionIssues;
      return true;
    },
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
        {row.original.hasCommissionIssues && (
          <Badge variant="outline" className="text-xs">
            Commission Issue
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "commissionRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Commission Rate
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-2 h-4 w-4" />
          ) : (
            <IconArrowsSort className="ml-2 h-4 w-4 opacity-40 group-hover:opacity-100" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono pl-0">
        <span
          className={
            row.original.hasCommissionIssues ? "text-muted-foreground" : ""
          }
        >
          {row.original.commissionRate}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "totalCommission",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Total Commission
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-2 h-4 w-4" />
          ) : (
            <IconArrowsSort className="ml-2 h-4 w-4 opacity-40 group-hover:opacity-100" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono pl-0">
        {formatTacAmount(row.original.totalCommission)} TAC
      </div>
    ),
  },
  {
    accessorKey: "burnAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Burn Amount
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-2 h-4 w-4" />
          ) : (
            <IconArrowsSort className="ml-2 h-4 w-4 opacity-40 group-hover:opacity-100" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono pl-0">
        <span
          className={
            row.original.shouldBurn ? "font-semibold" : "text-muted-foreground"
          }
        >
          {row.original.shouldBurn
            ? formatTacAmount(row.original.burnAmount)
            : "0.0"}{" "}
          TAC
        </span>
      </div>
    ),
  },
  {
    accessorKey: "shouldBurn",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Action Required
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge variant={row.original.shouldBurn ? "default" : "secondary"}>
        {row.original.shouldBurn ? "Burn Required" : "No Action"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Copy Address</DropdownMenuItem>
          <DropdownMenuSeparator />
          {row.original.shouldBurn && (
            <DropdownMenuItem>Execute Burn</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function ValidatorRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => {
        console.log(cell.column.id);
        const isNumber = [
          "commissionRate",
          "totalCommission",
          "burnAmount",
        ].includes(cell.column.id);
        return (
          <TableCell key={cell.id} className={isNumber ? "pl-5" : ""}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export function DataTable() {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const { selectedPeriod, refreshKey } = usePeriod();

  React.useEffect(() => {
    async function fetchValidators() {
      try {
        setLoading(true);
        const { apiClient } = await import("@/lib/api");
        const result = await apiClient.getValidators(selectedPeriod);

        // Transform the API data to match our schema
        const transformedData = result.validators.map((validator) => ({
          address: validator.address,
          moniker: validator.moniker || "Unknown",
          status: validator.status,
          isActive: validator.isActive,
          commissionRate: validator.commissionRate,
          burnAmount: validator.burnAmount,
          totalCommission: validator.totalCommission,
          shouldBurn: validator.shouldBurn,
          hasCommissionIssues: validator.hasCommissionIssues,
        }));

        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch validators:", err);
        setError("Failed to load validator data");
      } finally {
        setLoading(false);
      }
    }

    fetchValidators();
  }, [selectedPeriod, refreshKey]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.address,
    enableRowSelection: true,
    enableGlobalFilter: true,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const moniker = row.original.moniker.toLowerCase();
      const address = row.original.address.toLowerCase();
      return moniker.includes(searchValue) || address.includes(searchValue);
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <Tabs
      defaultValue="validators"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="validators">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="validators">Validators</SelectItem>
            <SelectItem value="burn-history">Burn History</SelectItem>
            <SelectItem value="reports">Reports</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="validators">Validators</TabsTrigger>
          <TabsTrigger disabled value="burn-history">
            Burn History <Badge variant="secondary">0</Badge>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="validators">
        <div className="hidden @4xl/main:flex items-center justify-end gap-3 -mt-15 mr-6 mb-5">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 w-60"
            />
          </div>

          <Select
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("status")?.setFilterValue(undefined);
              } else {
                table.getColumn("status")?.setFilterValue(value);
              }
            }}
          >
            <SelectTrigger className="w-40">
              <IconFilter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="issues">Issues</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={
              (table.getColumn("shouldBurn")?.getFilterValue() as string) ??
              "all"
            }
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("shouldBurn")?.setFilterValue(undefined);
              } else {
                table.getColumn("shouldBurn")?.setFilterValue(value === "burn");
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="burn">Burn</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              const csvData = table.getFilteredRowModel().rows.map((row) => ({
                Validator: row.original.moniker,
                Address: row.original.address,
                Status: row.original.isActive ? "Active" : "Inactive",
                "Commission Rate": row.original.commissionRate,
                "Total Commission": row.original.totalCommission,
                "Burn Amount": row.original.burnAmount,
                "Action Required": row.original.shouldBurn
                  ? "Burn Required"
                  : "No Action",
                "Commission Issues": row.original.hasCommissionIssues
                  ? "Yes"
                  : "No",
              }));

              const csv = [
                Object.keys(csvData[0] || {}).join(","),
                ...csvData.map((row) => Object.values(row).join(",")),
              ].join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `validators-${
                new Date().toISOString().split("T")[0]
              }.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              toast.success("Table exported successfully!");
            }}
            className="gap-2"
          >
            <IconDownload className="h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="flex flex-col gap-4 @4xl/main:hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {/* Global Search */}
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {/* Status Filter */}
              <Select
                value={
                  (table.getColumn("status")?.getFilterValue() as string) ??
                  "all"
                }
                onValueChange={(value) => {
                  if (value === "all") {
                    table.getColumn("status")?.setFilterValue(undefined);
                  } else {
                    table.getColumn("status")?.setFilterValue(value);
                  }
                }}
              >
                <SelectTrigger className="w-32">
                  <IconFilter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="issues">Issues</SelectItem>
                </SelectContent>
              </Select>

              {/* Burn Action Filter */}
              <Select
                value={
                  (table.getColumn("shouldBurn")?.getFilterValue() as string) ??
                  "all"
                }
                onValueChange={(value) => {
                  if (value === "all") {
                    table.getColumn("shouldBurn")?.setFilterValue(undefined);
                  } else {
                    table
                      .getColumn("shouldBurn")
                      ?.setFilterValue(value === "burn");
                  }
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="burn">Burn</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Button
                variant="outline"
                onClick={() => {
                  const csvData = table
                    .getFilteredRowModel()
                    .rows.map((row) => ({
                      Validator: row.original.moniker,
                      Address: row.original.address,
                      Status: row.original.isActive ? "Active" : "Inactive",
                      "Commission Rate": row.original.commissionRate,
                      "Total Commission": row.original.totalCommission,
                      "Burn Amount": row.original.burnAmount,
                      "Action Required": row.original.shouldBurn
                        ? "Burn Required"
                        : "No Action",
                      "Commission Issues": row.original.hasCommissionIssues
                        ? "Yes"
                        : "No",
                    }));

                  const csv = [
                    Object.keys(csvData[0] || {}).join(","),
                    ...csvData.map((row) => Object.values(row).join(",")),
                  ].join("\n");

                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `validators-${
                    new Date().toISOString().split("T")[0]
                  }.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);

                  toast.success("Table exported successfully!");
                }}
                className="gap-2 shrink-0"
              >
                <IconDownload className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="">
                    {Array.from({ length: columns.length }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table
                  .getRowModel()
                  .rows.map((row) => <ValidatorRow key={row.id} row={row} />)
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No validators found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-6 mt-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="burn-history" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="reports" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="settings" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}
