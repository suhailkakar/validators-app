"use client";

import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconSearch,
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
  totalAccumulatedRewards: z.string(),
  claimedRewards: z.string(),
  unclaimedRewards: z.string(),
  totalRewardsAlreadyBurnt: z.string(),
  totalRewardsToBeBurn: z.string(),
  totalAmountDelegated: z.string(),
  shouldBurn: z.boolean(),
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
          <span
            className="font-medium truncate max-w-[200px]"
            title={row.original.moniker}
          >
            {row.original.moniker}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {row.original.address.slice(0, 20)}...
          </span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "totalAmountDelegated",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          <div className="text-left leading-tight">
            Total Amount
            <br />
            Delegated
          </div>
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
      <div className="font-mono ">
        {formatTacAmount(row.original.totalAmountDelegated)} TAC
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const aVal = parseFloat(
        rowA.original.totalAmountDelegated.replace(/,/g, "") || "0"
      );
      const bVal = parseFloat(
        rowB.original.totalAmountDelegated.replace(/,/g, "") || "0"
      );
      return aVal - bVal;
    },
  },

  {
    accessorKey: "claimedRewards",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          <div className="text-left leading-tight">
            Claimed
            <br />
            Rewards
          </div>
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
      <div className="font-mono ">
        {formatTacAmount(row.original.claimedRewards)} TAC
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const aVal = parseFloat(
        rowA.original.claimedRewards.replace(/,/g, "") || "0"
      );
      const bVal = parseFloat(
        rowB.original.claimedRewards.replace(/,/g, "") || "0"
      );
      return aVal - bVal;
    },
  },
  {
    accessorKey: "unclaimedRewards",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          <div className="text-left leading-tight">
            Unclaimed
            <br />
            Rewards
          </div>
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
      <div className="font-mono ">
        {formatTacAmount(row.original.unclaimedRewards)} TAC
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const aVal = parseFloat(
        rowA.original.unclaimedRewards.replace(/,/g, "") || "0"
      );
      const bVal = parseFloat(
        rowB.original.unclaimedRewards.replace(/,/g, "") || "0"
      );
      return aVal - bVal;
    },
  },
  {
    accessorKey: "totalAccumulatedRewards",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          <div className="text-left leading-tight">
            Total Accumulated
            <br />
            Rewards (90%)
          </div>
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
      <div className="font-mono ">
        {formatTacAmount(row.original.totalAccumulatedRewards)} TAC
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const aVal = parseFloat(
        rowA.original.totalAccumulatedRewards.replace(/,/g, "") || "0"
      );
      const bVal = parseFloat(
        rowB.original.totalAccumulatedRewards.replace(/,/g, "") || "0"
      );
      return aVal - bVal;
    },
  },
  {
    accessorKey: "totalRewardsToBeBurn",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          <div className="text-left leading-tight">
            Total Rewards
            <br />
            to be Burn
          </div>
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
      <div className="font-mono ">
        {formatTacAmount(row.original.totalRewardsToBeBurn)} TAC
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const aVal = parseFloat(
        rowA.original.totalRewardsToBeBurn.replace(/,/g, "") || "0"
      );
      const bVal = parseFloat(
        rowB.original.totalRewardsToBeBurn.replace(/,/g, "") || "0"
      );
      return aVal - bVal;
    },
  },
  {
    accessorKey: "totalRewardsAlreadyBurnt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          <div className="text-left leading-tight">
            Total Rewards Already
            <br />
            Sent to Burn
          </div>
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
      <div className="font-mono ">
        {formatTacAmount(row.original.totalRewardsAlreadyBurnt)} TAC
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const aVal = parseFloat(
        rowA.original.totalRewardsAlreadyBurnt.replace(/,/g, "") || "0"
      );
      const bVal = parseFloat(
        rowB.original.totalRewardsAlreadyBurnt.replace(/,/g, "") || "0"
      );
      return aVal - bVal;
    },
  },
];

function ValidatorRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => {
        const isNumber = [
          "totalAccumulatedRewards",
          "claimedRewards",
          "unclaimedRewards",
          "totalRewardsAlreadyBurnt",
          "totalRewardsToBeBurn",
          "totalAmountDelegated",
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
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "totalAccumulatedRewards", desc: true },
  ]);
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
        const { cosmosClient } = await import("@/lib/cosmosClient");
        const result = await cosmosClient.getValidators();

        // Transform the API data to match our schema
        type ValidatorApi = {
          address: string;
          moniker?: string;
          status: string;
          isActive: boolean;
          totalAccumulatedRewards?: string;
          claimedRewards?: string;
          unclaimedRewards?: string;
          totalRewardsAlreadyBurnt?: string;
          totalRewardsToBeBurn?: string;
          totalAmountDelegated?: string;
          shouldBurn?: boolean;
        };

        const transformedData = result.validators.map(
          (validator: ValidatorApi) => ({
            address: validator.address,
            moniker: validator.moniker || "Unknown",
            status: validator.status,
            isActive: validator.isActive,
            totalAccumulatedRewards: validator.totalAccumulatedRewards || "0",
            claimedRewards: validator.claimedRewards || "0",
            unclaimedRewards: validator.unclaimedRewards || "0",
            totalRewardsAlreadyBurnt: validator.totalRewardsAlreadyBurnt || "0",
            totalRewardsToBeBurn: validator.totalRewardsToBeBurn || "0",
            totalAmountDelegated: validator.totalAmountDelegated || "0",
            shouldBurn: validator.shouldBurn ?? false,
          })
        );

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

          <Button variant="outline" className="gap-2">
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
              {/* Export Button */}
              <Button variant="outline" className="gap-2 shrink-0">
                <IconDownload className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10 h-16">
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
                <>
                  {table.getRowModel().rows.map((row) => (
                    <ValidatorRow key={row.id} row={row} />
                  ))}
                  {/* Totals Row */}
                  <TableRow className="border-t-2 border-border bg-muted font-medium ">
                    <TableCell></TableCell>
                    <TableCell className="font-semibold">TOTALS</TableCell>
                    <TableCell className="font-mono ">
                      <p className="ml-2.5">
                        {formatTacAmount(
                          data.reduce(
                            (sum, row) =>
                              (
                                BigInt(sum.toString()) +
                                BigInt(row.totalAmountDelegated || "0")
                              ).toString(),
                            "0"
                          )
                        )}{" "}
                        TAC
                      </p>
                    </TableCell>

                    <TableCell className="font-mono ">
                      <p className="ml-2.5">
                        {formatTacAmount(
                          data.reduce(
                            (sum, row) =>
                              (
                                BigInt(sum.toString()) +
                                BigInt(row.claimedRewards || "0")
                              ).toString(),
                            "0"
                          )
                        )}{" "}
                        TAC
                      </p>
                    </TableCell>
                    <TableCell className="font-mono ">
                      <p className="ml-2.5">
                        {formatTacAmount(
                          data.reduce(
                            (sum, row) =>
                              (
                                BigInt(sum.toString()) +
                                BigInt(row.unclaimedRewards || "0")
                              ).toString(),
                            "0"
                          )
                        )}{" "}
                        TAC
                      </p>
                    </TableCell>
                    <TableCell className="font-mono ">
                      <p className="ml-2.5">
                        {formatTacAmount(
                          data.reduce(
                            (sum, row) =>
                              (
                                BigInt(sum.toString()) +
                                BigInt(row.totalAccumulatedRewards || "0")
                              ).toString(),
                            "0"
                          )
                        )}{" "}
                        TAC
                      </p>
                    </TableCell>
                    <TableCell className="font-mono ">
                      <p className="ml-2.5">
                        {formatTacAmount(
                          data.reduce(
                            (sum, row) =>
                              (
                                BigInt(sum.toString()) +
                                BigInt(row.totalRewardsToBeBurn || "0")
                              ).toString(),
                            "0"
                          )
                        )}{" "}
                        TAC
                      </p>
                    </TableCell>
                    <TableCell className="font-mono ">
                      <p className="ml-2.5">
                        {formatTacAmount(
                          data.reduce(
                            (sum, row) =>
                              (
                                BigInt(sum.toString()) +
                                BigInt(row.totalRewardsAlreadyBurnt || "0")
                              ).toString(),
                            "0"
                          )
                        )}{" "}
                        TAC
                      </p>
                    </TableCell>
                  </TableRow>
                </>
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
