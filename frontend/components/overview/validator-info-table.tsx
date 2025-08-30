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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Demo data for 20 validators
const demoValidators = [
  {
    id: 1,
    moniker: "Cosmos Validator",
    address: "cosmos1abc...xyz",
    status: "active",
    commission: "10.0",
    votingPower: "15.2",
    uptime: "99.8",
    delegators: 1247,
  },
  {
    id: 2,
    moniker: "StakeLab",
    address: "cosmos1def...uvw",
    status: "active",
    commission: "8.5",
    votingPower: "12.8",
    uptime: "99.9",
    delegators: 892,
  },
  {
    id: 3,
    moniker: "Validator One",
    address: "cosmos1ghi...rst",
    status: "active",
    commission: "12.0",
    votingPower: "11.5",
    uptime: "99.7",
    delegators: 756,
  },
  {
    id: 4,
    moniker: "Stake Capital",
    address: "cosmos1jkl...mno",
    status: "active",
    commission: "9.2",
    votingPower: "10.3",
    uptime: "99.6",
    delegators: 634,
  },
  {
    id: 5,
    moniker: "Chainflow",
    address: "cosmos1pqr...stu",
    status: "active",
    commission: "11.5",
    votingPower: "9.8",
    uptime: "99.9",
    delegators: 578,
  },
  {
    id: 6,
    moniker: "Validator Hub",
    address: "cosmos1vwx...yza",
    status: "active",
    commission: "8.8",
    votingPower: "8.9",
    uptime: "99.8",
    delegators: 512,
  },
  {
    id: 7,
    moniker: "Stake Zone",
    address: "cosmos1bcd...efg",
    status: "active",
    commission: "10.5",
    votingPower: "8.2",
    uptime: "99.7",
    delegators: 445,
  },
  {
    id: 8,
    moniker: "Validator Pro",
    address: "cosmos1hij...klm",
    status: "active",
    commission: "9.8",
    votingPower: "7.6",
    uptime: "99.9",
    delegators: 398,
  },
  {
    id: 9,
    moniker: "Stake Master",
    address: "cosmos1nop...qrs",
    status: "active",
    commission: "11.2",
    votingPower: "7.1",
    uptime: "99.8",
    delegators: 356,
  },
  {
    id: 10,
    moniker: "Chain Validator",
    address: "cosmos1tuv...wxy",
    status: "active",
    commission: "8.9",
    votingPower: "6.8",
    uptime: "99.7",
    delegators: 324,
  },
  {
    id: 11,
    moniker: "Validator Elite",
    address: "cosmos1zab...cde",
    status: "active",
    commission: "10.8",
    votingPower: "6.3",
    uptime: "99.9",
    delegators: 298,
  },
  {
    id: 12,
    moniker: "Stake Elite",
    address: "cosmos1fgh...ijk",
    status: "active",
    commission: "9.5",
    votingPower: "5.9",
    uptime: "99.8",
    delegators: 267,
  },
  {
    id: 13,
    moniker: "Validator Prime",
    address: "cosmos1lmn...opq",
    status: "active",
    commission: "11.8",
    votingPower: "5.4",
    uptime: "99.7",
    delegators: 245,
  },
  {
    id: 14,
    moniker: "Stake Prime",
    address: "cosmos1rst...uvw",
    status: "active",
    commission: "8.7",
    votingPower: "5.1",
    uptime: "99.9",
    delegators: 223,
  },
  {
    id: 15,
    moniker: "Chain Elite",
    address: "cosmos1xyz...abc",
    status: "active",
    commission: "10.3",
    votingPower: "4.8",
    uptime: "99.8",
    delegators: 201,
  },
  {
    id: 16,
    moniker: "Validator Core",
    address: "cosmos1def...ghi",
    status: "active",
    commission: "9.9",
    votingPower: "4.5",
    uptime: "99.7",
    delegators: 189,
  },
  {
    id: 17,
    moniker: "Stake Core",
    address: "cosmos1jkl...mno",
    status: "active",
    commission: "11.1",
    votingPower: "4.2",
    uptime: "99.9",
    delegators: 178,
  },
  {
    id: 18,
    moniker: "Validator Base",
    address: "cosmos1pqr...stu",
    status: "active",
    commission: "8.6",
    votingPower: "3.9",
    uptime: "99.8",
    delegators: 167,
  },
  {
    id: 19,
    moniker: "Stake Base",
    address: "cosmos1vwx...yza",
    status: "active",
    commission: "10.7",
    votingPower: "3.6",
    uptime: "99.7",
    delegators: 156,
  },
  {
    id: 20,
    moniker: "Chain Core",
    address: "cosmos1bcd...efg",
    status: "active",
    commission: "9.4",
    votingPower: "3.3",
    uptime: "99.9",
    delegators: 145,
  },
];

type Validator = (typeof demoValidators)[0];

const columns: ColumnDef<Validator>[] = [
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
            {row.original.address}
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
      if (value === "active") return row.original.status === "active";
      if (value === "inactive") return row.original.status === "inactive";
      return true;
    },
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge
          variant={row.original.status === "active" ? "default" : "secondary"}
        >
          {row.original.status}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "commission",
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
      <div className="font-mono pl-0">{row.original.commission}%</div>
    ),
  },
  {
    accessorKey: "votingPower",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Voting Power
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
      <div className="font-mono pl-0">{row.original.votingPower}%</div>
    ),
  },
  {
    accessorKey: "uptime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Uptime
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
      <div className="font-mono pl-0">{row.original.uptime}%</div>
    ),
  },
  {
    accessorKey: "delegators",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Delegators
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
        {row.original.delegators.toLocaleString()}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>
    ),
  },
];

function ValidatorRow({ row }: { row: Row<Validator> }) {
  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => {
        const isNumber = [
          "commission",
          "votingPower",
          "uptime",
          "delegators",
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

export function ValidatorInfoTable() {
  const [data] = React.useState(demoValidators);
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
    getRowId: (row) => row.id.toString(),
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
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="validators">Validators</TabsTrigger>
          <TabsTrigger disabled value="performance">
            Performance <Badge variant="secondary">0</Badge>
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
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              const csvData = table.getFilteredRowModel().rows.map((row) => ({
                Validator: row.original.moniker,
                Address: row.original.address,
                Status: row.original.status,
                "Commission Rate": `${row.original.commission}%`,
                "Voting Power": `${row.original.votingPower}%`,
                Uptime: `${row.original.uptime}%`,
                Delegators: row.original.delegators,
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
                      Status: row.original.status,
                      "Commission Rate": `${row.original.commission}%`,
                      "Voting Power": `${row.original.votingPower}%`,
                      Uptime: `${row.original.uptime}%`,
                      Delegators: row.original.delegators,
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
              {table.getRowModel().rows?.length ? (
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
      <TabsContent value="performance" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="analytics" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="settings" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}
