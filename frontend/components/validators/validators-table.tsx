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
  IconExternalLink,
  IconGlobe,
  IconInfoCircle,
  IconUsers,
  IconCoins,
  IconClock,
  IconShield,
  IconDroplet,
  IconPercentage,
  IconKey,
  IconFingerprint,
  IconReceipt,
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, ExternalLink } from "lucide-react";

// Demo data for validators with enhanced fields
const demoValidators = [
  {
    id: 1,
    moniker: "Cosmos Validator",
    address: "cosmos1abc...xyz",
    commission: "10.0",
    delegatedStake: "2,847,392,156",
    delegatorCount: 1247,
    outstandingRewards: "45,678",
    lifetimeRewards: "156,789",
    status: "bonded",
    website: "https://cosmosvalidator.com",
    description:
      "Professional validator with 99.9% uptime and secure infrastructure.",
    votingPower: "15.2",
    selfDelegation: "500,000,000",
    networkStakePercentage: "12.8",
    outstandingCommission: "23,456",
    lifetimeCommission: "89,123",
    burnRequirement: "18,765",
    uptime: "99.9",
    missedBlocks: 2,
    lastBlockSigned: "2024-03-15 14:32:15",
    votingParticipation: "94.5",
  },
  {
    id: 2,
    moniker: "StakeLab",
    address: "cosmos1def...uvw",
    commission: "8.5",
    delegatedStake: "1,892,456,789",
    delegatorCount: 892,
    outstandingRewards: "32,145",
    lifetimeRewards: "98,432",
    status: "bonded",
    website: "https://stakelab.io",
    description:
      "Leading staking service provider with institutional-grade security.",
    votingPower: "12.8",
    selfDelegation: "300,000,000",
    networkStakePercentage: "8.5",
    outstandingCommission: "18,234",
    lifetimeCommission: "67,890",
    burnRequirement: "14,567",
    uptime: "99.8",
    missedBlocks: 4,
    lastBlockSigned: "2024-03-15 14:31:42",
    votingParticipation: "96.2",
  },
  {
    id: 3,
    moniker: "Validator One",
    address: "cosmos1ghi...rst",
    commission: "12.0",
    delegatedStake: "1,756,234,567",
    delegatorCount: 756,
    outstandingRewards: "28,901",
    lifetimeRewards: "87,654",
    status: "bonded",
    website: "https://validatorone.com",
    description: "Reliable validator with competitive commission rates.",
    votingPower: "11.5",
    selfDelegation: "250,000,000",
    networkStakePercentage: "7.9",
    outstandingCommission: "16,789",
    lifetimeCommission: "58,765",
    burnRequirement: "12,345",
    uptime: "99.7",
    missedBlocks: 6,
    lastBlockSigned: "2024-03-15 14:30:18",
    votingParticipation: "93.8",
  },
  {
    id: 4,
    moniker: "Stake Capital",
    address: "cosmos1jkl...mno",
    commission: "9.2",
    delegatedStake: "1,634,567,890",
    delegatorCount: 634,
    outstandingRewards: "25,678",
    lifetimeRewards: "76,543",
    status: "bonded",
    website: "https://stakecapital.com",
    description: "Professional staking services with excellent performance.",
    votingPower: "10.3",
    selfDelegation: "200,000,000",
    networkStakePercentage: "7.2",
    outstandingCommission: "15,234",
    lifetimeCommission: "52,345",
    burnRequirement: "10,987",
    uptime: "99.6",
    missedBlocks: 8,
    lastBlockSigned: "2024-03-15 14:29:55",
    votingParticipation: "95.1",
  },
  {
    id: 5,
    moniker: "Chainflow",
    address: "cosmos1pqr...stu",
    commission: "11.5",
    delegatedStake: "1,578,901,234",
    delegatorCount: 578,
    outstandingRewards: "23,456",
    lifetimeRewards: "65,432",
    status: "bonded",
    website: "https://chainflow.io",
    description: "Innovative validator with cutting-edge infrastructure.",
    votingPower: "9.8",
    selfDelegation: "180,000,000",
    networkStakePercentage: "6.8",
    outstandingCommission: "14,567",
    lifetimeCommission: "48,765",
    burnRequirement: "9,876",
    uptime: "99.9",
    missedBlocks: 1,
    lastBlockSigned: "2024-03-15 14:32:08",
    votingParticipation: "97.3",
  },
  {
    id: 6,
    moniker: "Validator Hub",
    address: "cosmos1vwx...yza",
    commission: "8.8",
    delegatedStake: "1,512,345,678",
    delegatorCount: 512,
    outstandingRewards: "21,234",
    lifetimeRewards: "54,321",
    status: "bonded",
    website: "https://validatorhub.com",
    description: "Community-focused validator with transparent operations.",
    votingPower: "8.9",
    selfDelegation: "150,000,000",
    networkStakePercentage: "6.4",
    outstandingCommission: "13,456",
    lifetimeCommission: "45,678",
    burnRequirement: "8,765",
    uptime: "99.8",
    missedBlocks: 3,
    lastBlockSigned: "2024-03-15 14:31:25",
    votingParticipation: "94.7",
  },
  {
    id: 7,
    moniker: "Stake Zone",
    address: "cosmos1bcd...efg",
    commission: "10.5",
    delegatedStake: "1,445,678,901",
    delegatorCount: 445,
    outstandingRewards: "19,012",
    lifetimeRewards: "43,210",
    status: "bonded",
    website: "https://stakezone.com",
    description: "Secure and reliable staking infrastructure provider.",
    votingPower: "8.2",
    selfDelegation: "120,000,000",
    networkStakePercentage: "5.9",
    outstandingCommission: "12,345",
    lifetimeCommission: "42,123",
    burnRequirement: "7,654",
    uptime: "99.7",
    missedBlocks: 5,
    lastBlockSigned: "2024-03-15 14:30:47",
    votingParticipation: "93.2",
  },
  {
    id: 8,
    moniker: "Validator Pro",
    address: "cosmos1hij...klm",
    commission: "9.8",
    delegatedStake: "1,398,765,432",
    delegatorCount: 398,
    outstandingRewards: "17,890",
    lifetimeRewards: "32,109",
    status: "bonded",
    website: "https://validatorpro.com",
    description: "Professional validator with enterprise-grade security.",
    votingPower: "7.6",
    selfDelegation: "100,000,000",
    networkStakePercentage: "5.5",
    outstandingCommission: "11,234",
    lifetimeCommission: "38,765",
    burnRequirement: "6,543",
    uptime: "99.9",
    missedBlocks: 2,
    lastBlockSigned: "2024-03-15 14:32:12",
    votingParticipation: "96.8",
  },
  {
    id: 9,
    moniker: "Stake Master",
    address: "cosmos1nop...qrs",
    commission: "11.2",
    delegatedStake: "1,356,789,012",
    delegatorCount: 356,
    outstandingRewards: "16,789",
    lifetimeRewards: "21,098",
    status: "bonded",
    website: "https://stakemaster.com",
    description: "Master of staking with proven track record.",
    votingPower: "7.1",
    selfDelegation: "80,000,000",
    networkStakePercentage: "5.1",
    outstandingCommission: "10,123",
    lifetimeCommission: "35,678",
    burnRequirement: "5,432",
    uptime: "99.8",
    missedBlocks: 4,
    lastBlockSigned: "2024-03-15 14:31:38",
    votingParticipation: "95.4",
  },
  {
    id: 10,
    moniker: "Chain Validator",
    address: "cosmos1tuv...wxy",
    commission: "8.9",
    delegatedStake: "1,324,567,890",
    delegatorCount: 324,
    outstandingRewards: "15,678",
    lifetimeRewards: "19,876",
    status: "unbonded",
    website: "https://chainvalidator.com",
    description: "Chain-native validator with deep protocol knowledge.",
    votingPower: "6.8",
    selfDelegation: "60,000,000",
    networkStakePercentage: "4.8",
    outstandingCommission: "9,012",
    lifetimeCommission: "32,456",
    burnRequirement: "4,321",
    uptime: "99.9",
    missedBlocks: 1,
    lastBlockSigned: "2024-03-15 14:32:05",
    votingParticipation: "97.1",
  },
];

// Demo data for delegators with more details
const getDemoDelegators = (validatorId: number) => [
  {
    address: "cosmos1del...abc",
    amount: "1,234,567",
    when: "2024-01-15",
    rewardsShare: "45,678",
    currentStake: "1,234,567",
  },
  {
    address: "cosmos1del...def",
    amount: "987,654",
    when: "2024-01-20",
    rewardsShare: "32,145",
    currentStake: "987,654",
  },
  {
    address: "cosmos1del...ghi",
    amount: "567,890",
    when: "2024-02-01",
    rewardsShare: "18,901",
    currentStake: "567,890",
  },
  {
    address: "cosmos1del...jkl",
    amount: "456,789",
    when: "2024-02-10",
    rewardsShare: "15,234",
    currentStake: "456,789",
  },
  {
    address: "cosmos1del...mno",
    amount: "345,678",
    when: "2024-02-15",
    rewardsShare: "12,567",
    currentStake: "345,678",
  },
];

// Demo data for unbondings with completion dates
const getDemoUnbondings = (validatorId: number) => [
  {
    address: "cosmos1unb...abc",
    amount: "123,456",
    when: "2024-03-01",
    completionDate: "2024-04-01 12:00:00",
  },
  {
    address: "cosmos1unb...def",
    amount: "98,765",
    when: "2024-03-05",
    completionDate: "2024-04-05 12:00:00",
  },
  {
    address: "cosmos1unb...ghi",
    amount: "76,543",
    when: "2024-03-10",
    completionDate: "2024-04-10 12:00:00",
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
          Moniker
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
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Status
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
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            row.original.status === "bonded"
              ? "bg-green-500"
              : row.original.status === "unbonded"
              ? "bg-yellow-500"
              : row.original.status === "jailed"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        />
        <span className="capitalize">{row.original.status}</span>
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
          Commission %
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
    accessorKey: "delegatedStake",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Delegated Stake
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
      <div className="font-mono pl-0">{row.original.delegatedStake} TAC</div>
    ),
  },
  {
    accessorKey: "delegatorCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Delegator Count
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
        {row.original.delegatorCount.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "outstandingRewards",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Outstanding Rewards
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
        {row.original.outstandingRewards} TAC
      </div>
    ),
  },
  {
    accessorKey: "lifetimeRewards",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto px-0 py-0 font-semibold group justify-start"
        >
          Lifetime Rewards
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
      <div className="font-mono pl-0">{row.original.lifetimeRewards} TAC</div>
    ),
  },
];

function ValidatorRow({
  row,
  onRowClick,
}: {
  row: Row<Validator>;
  onRowClick: (validator: Validator) => void;
}) {
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onRowClick(row.original)}
    >
      {row.getVisibleCells().map((cell) => {
        const isNumber = [
          "commission",
          "delegatedStake",
          "delegatorCount",
          "outstandingRewards",
          "lifetimeRewards",
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

export function ValidatorsTable() {
  const [data] = React.useState(demoValidators);
  const [selectedValidator, setSelectedValidator] =
    React.useState<Validator | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);
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

  const handleRowClick = (validator: Validator) => {
    setSelectedValidator(validator);
    setIsSheetOpen(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

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
    <>
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
                <SelectItem value="bonded">Bonded</SelectItem>
                <SelectItem value="unbonded">Unbonded</SelectItem>
                <SelectItem value="jailed">Jailed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                const csvData = table.getFilteredRowModel().rows.map((row) => ({
                  Moniker: row.original.moniker,
                  Address: row.original.address,
                  "Commission %": `${row.original.commission}%`,
                  "Delegated Stake": `${row.original.delegatedStake} TAC`,
                  "Delegator Count": row.original.delegatorCount,
                  "Outstanding Rewards": `${row.original.outstandingRewards} TAC`,
                  "Lifetime Rewards": `${row.original.lifetimeRewards} TAC`,
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

                <Button
                  variant="outline"
                  onClick={() => {
                    const csvData = table
                      .getFilteredRowModel()
                      .rows.map((row) => ({
                        Moniker: row.original.moniker,
                        Address: row.original.address,
                        "Commission %": `${row.original.commission}%`,
                        "Delegated Stake": `${row.original.delegatedStake} TAC`,
                        "Delegator Count": row.original.delegatorCount,
                        "Outstanding Rewards": `${row.original.outstandingRewards} TAC`,
                        "Lifetime Rewards": `${row.original.lifetimeRewards} TAC`,
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
                    .rows.map((row) => (
                      <ValidatorRow
                        key={row.id}
                        row={row}
                        onRowClick={handleRowClick}
                      />
                    ))
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
                  <span className="flex size-8 items-center justify-center">
                    <IconChevronLeft />
                  </span>
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

      {/* Enhanced Validator Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[600px] sm:max-w-[900px] overflow-y-auto p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">
                      {selectedValidator?.moniker}
                    </h2>
                    <Badge
                      variant={
                        selectedValidator?.status === "bonded"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedValidator?.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Commission: {selectedValidator?.commission}%</span>
                    <span>Voting Power: {selectedValidator?.votingPower}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(selectedValidator?.address || "")
                      }
                      className="h-8 px-3"
                    >
                      {copiedAddress === selectedValidator?.address ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Copy Operator Address
                    </Button>
                  </div>
                </div>
                {selectedValidator?.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 px-3"
                  >
                    <a
                      href={selectedValidator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {selectedValidator?.status !== "bonded" && (
              <Alert>
                <AlertDescription>
                  This validator is not currently bonded and may not be
                  participating in consensus.
                </AlertDescription>
              </Alert>
            )}

            {/* Main Content */}
            <div className=" flex flex-col gap-4">
              <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <IconShield className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Validator Status</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2 font-medium">
                      {selectedValidator?.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Jailed:</span>
                    <span className="ml-2 font-medium">No</span>
                  </div>
                </div>
              </div>
              {/* Liquid Staking */}
              <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <IconDroplet className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Liquid Staking</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Validator Bonded:
                    </span>
                    <span className="ml-2 font-medium">-</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Liquid Shares:
                    </span>
                    <span className="ml-2 font-medium">250,402,995 TAC</span>
                  </div>
                </div>
              </div>

              {/* Staking Metrics */}
              <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <IconPercentage className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Staking Metrics</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Bonded Tokens:
                    </span>
                    <span className="font-medium">
                      {selectedValidator?.delegatedStake}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Self Bonded:</span>
                    <span className="font-medium">
                      {selectedValidator?.selfDelegation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      % of Total Network:
                    </span>
                    <span className="font-medium">
                      {selectedValidator?.votingPower}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Unbonding Information */}
              <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <IconKey className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Unbonding Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Unbonding Height:
                    </span>
                    <span className="font-medium">3430866</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Unbonding Time:
                    </span>
                    <span className="font-medium">4 days ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Annual Profit:
                    </span>
                    <span className="font-medium">1.69%</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <IconPercentage className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Commission Rate</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="font-medium">
                      {selectedValidator?.commission}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Change:</span>
                    <span className="font-medium">±10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max:</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated: 2025-07-16 23:25:06
                  </div>
                </div>
              </div>
              {/* Commissions & Rewards */}
              <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <IconReceipt className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Commissions & Rewards</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commissions:</span>
                    <span className="font-medium">2,343,845.33 TAC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Outstanding Rewards:
                    </span>
                    <span className="font-medium">
                      {selectedValidator?.outstandingRewards}
                    </span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <IconFingerprint className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Addresses</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Account:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        tac1vff4r0nc766n6x68ceatv4ffea2ltr8lj88fxj
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            "tac1vff4r0nc766n6x68ceatv4ffea2ltr8lj88fxj"
                          )
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Operator:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {selectedValidator?.address}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(selectedValidator?.address || "")
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hex:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        0370C69318CFE73D2325DCF159BF8C040C0CC407
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            "0370C69318CFE73D2325DCF159BF8C040C0CC407"
                          )
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Signer:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        tacvalcons1qdcvdyccelnn6ge9mnc4n0uvqsxqe3q80zej2q
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            "tacvalcons1qdcvdyccelnn6ge9mnc4n0uvqsxqe3q80zej2q"
                          )
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consensus Public Key */}
              <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <IconKey className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Consensus Public Key</h3>
                </div>
                <div className="text-xs bg-muted p-2 rounded font-mono">
                  {JSON.stringify(
                    {
                      "@type": "/cosmos.crypto.ed25519.PubKey",
                      key: "AhkLRx/08ZMDij3O/1azhz+OLdVMDGzBtMc6Uu8lwYg=",
                    },
                    null,
                    2
                  )}
                </div>
              </div>
            </div>

            <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <IconReceipt className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Height</th>
                      <th className="text-left py-2 font-medium">Hash</th>
                      <th className="text-left py-2 font-medium">Messages</th>
                      <th className="text-left py-2 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">2281734</td>
                      <td className="py-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          AFF911B8AEBFFF6D46134D3023CB8967E8CF66017CD037D657BE74E746AF9841
                        </code>
                      </td>
                      <td className="py-2">CreateValidator</td>
                      <td className="py-2">a month ago</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">3409265</td>
                      <td className="py-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          52E0EE3F40C334CAEDD28290E7844BE44D3E550D9F8402D3041EF2389917B02F
                        </code>
                      </td>
                      <td className="py-2">Unjail</td>
                      <td className="py-2">25 days ago</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">3549203</td>
                      <td className="py-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          6075D6E8C0A306BA3997044F3E56CBD0B2C15A5244236F65D3FD2738F4920C18
                        </code>
                      </td>
                      <td className="py-2">Unjail</td>
                      <td className="py-2">23 days ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
