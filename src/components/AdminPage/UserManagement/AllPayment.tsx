// src/components/admin/all-payment/AllPayment.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { IoChevronDown } from "react-icons/io5";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useGetPaymentsQuery } from "@/redux/features/auth/paymentApi";

import defaultAvatar from "../../../assets/images/profile.png";

import { Subscription, SubscriptionStatusFilter } from "@/redux/types/venue.type";
import PageLoader from "../Shared/PageLoader";
import { Button } from "@/components/ui/button";

// Status configuration for subscriptions
const STATUS_CONFIG: Record<
  "active" | "expired",
  { text: string; bg: string; textColor: string }
> = {
  active: {
    text: "Active",
    bg: "bg-green-100",
    textColor: "text-green-800",
  },
  expired: {
    text: "Expired",
    bg: "bg-red-100",
    textColor: "text-red-800",
  },
};

// Columns definition
export const getColumns = (
  _setStatusFilter: (status: SubscriptionStatusFilter) => void,
  statusFilterDropdown: React.ReactNode
): ColumnDef<Subscription>[] => [
  {
    accessorKey: "user",
    header: "User Info",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
            <Image
              src={user.profilePictureUrl || defaultAvatar}
              alt={user.fullName}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.fullName}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => statusFilterDropdown,
    cell: ({ row }) => {
      const status = row.getValue("status") as "active" | "expired";
      const config = STATUS_CONFIG[status];

      return (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.textColor}`}
        >
          {config.text}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const price = row.original.subscriptionPlan.price;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return (
        <div className="text-right font-medium text-gray-900">{formatted}</div>
      );
    },
  },
  {
    accessorKey: "plan",
    header: () => <div className="text-left">Plan</div>,
    cell: ({ row }) => {
      const plan = row.original.subscriptionPlan;
      return <div className="text-left text-gray-700">{plan.planName}</div>;
    },
  },
  {
    accessorKey: "daysRemaining",
    header: () => <div className="text-center">Days Remaining</div>,
    cell: ({ row }) => {
      const days = row.original.daysRemaining;
      return (
        <div className="text-center font-medium text-gray-900">{days} days</div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-center space-x-2">
        <Link
          href={`/admin/all-payment/details/${row.original.subscriptionId}`}
          className="text-gray-700 hover:bg-gray-50 cursor-pointer border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-gray-900"
        >
          View Details
        </Link>
      </div>
    ),
  },
];

// Main component
export function AllPayment() {
  const [statusFilter, setStatusFilter] = React.useState<SubscriptionStatusFilter>("all");
  const { data: subscriptionsData, isLoading, isError } = useGetPaymentsQuery(statusFilter);
  console.log("Subscriptions Data:", subscriptionsData);
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);

  const subscriptions = React.useMemo(() => {
    return subscriptionsData?.subscriptions || [];
  }, [subscriptionsData]);

  const statusFilterDropdown = (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
        className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 border border-gray-300 cursor-pointer"
      >
        <span className="whitespace-nowrap ">
          Status:{" "}
          <span className="font-semibold text-gray-800 ">
            {statusFilter === "all" 
              ? "All" 
              : statusFilter === "active" 
              ? "Active" 
              : "Expired"}
          </span>
        </span>
        <IoChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            statusDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {statusDropdownOpen && (
        <div className="absolute left-0 z-10 mt-2 w-44 origin-top-left rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1 text-sm text-gray-700">
            <div
              className={`px-4 py-1.5 cursor-pointer rounded-sm ${
                statusFilter === "all"
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setStatusFilter("all");
                setStatusDropdownOpen(false);
              }}
            >
              All Statuses
            </div>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <div
                key={status}
                className={`px-4 py-1.5 cursor-pointer rounded-sm ${
                  statusFilter === status
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  setStatusFilter(status as SubscriptionStatusFilter);
                  setStatusDropdownOpen(false);
                }}
              >
                {config.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const columns = React.useMemo(
    () => getColumns(setStatusFilter, statusFilterDropdown),
    [statusFilterDropdown]
  );

  const table = useReactTable({
    data: subscriptions,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-4 text-red-500">
        Error loading payments
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              subscriptions.length
            )}
          </span>{" "}
          of <span className="font-medium">{subscriptionsData?.total || subscriptions.length}</span> subscriptions
          {subscriptionsData && (
            <span className="ml-2 text-gray-500">
              ({subscriptionsData.activeCount} active, {subscriptionsData.expiredCount} expired)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
            style={{
              backgroundColor: !table.getCanPreviousPage() ? "white" : "white",
              color: "#2D0954",
              borderColor: "#2D0954",
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
            style={{
              backgroundColor: !table.getCanNextPage() ? "white" : "white",
              color: "#2D0954",
              borderColor: "#2D0954",
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import * as React from "react";
// import Image from "next/image";
// import { IoChevronDown } from "react-icons/io5";
// import {
//   ColumnDef,
//   SortingState,
//   VisibilityState,
//   ColumnFiltersState,
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import venuphoto1 from "@/assets/images/venuphoto1.png";
// import Link from "next/link";

// // Define status types more precisely
// export type PaymentStatus = "blocked" | "completed" | "pending" | "refunded";

// export type UserPayment = {
//   id: string;
//   user: {
//     name: string;
//     email: string;
//     avatar: string;
//   };
//   status: PaymentStatus;
//   amount: number;
//   commission: number;
// };

// // Professional color palette
// const COLORS = {
//   primary: "#4F46E5", // Indigo
//   secondary: "#6B7280", // Gray
//   success: "#10B981", // Emerald
//   warning: "#F59E0B", // Amber
//   error: "#EF4444", // Red
//   info: "#3B82F6", // Blue
//   background: "#F9FAFB", // Light gray
//   text: "#111827", // Gray-900
//   border: "#E5E7EB", // Gray-200
// };

// // Status configuration
// const STATUS_CONFIG: Record<
//   PaymentStatus,
//   { text: string; bg: string; textColor: string }
// > = {
//   blocked: {
//     text: "Blocked",
//     bg: "bg-red-100",
//     textColor: "text-red-800",
//   },

//   completed: {
//     text: "Completed",
//     bg: "bg-green-100",
//     textColor: "text-green-800",
//   },
//   pending: {
//     text: "Pending",
//     bg: "bg-blue-100",
//     textColor: "text-blue-800",
//   },
//   refunded: {
//     text: "Refunded",
//     bg: "bg-purple-100",
//     textColor: "text-purple-800",
//   },
// };

// // Sample Data
// const data: UserPayment[] = [
//   {
//     id: "PAY-2025-0001",
//     user: {
//       name: "John Doe",
//       email: "john@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "blocked",
//     amount: 1200,
//     commission: 200,
//   },
//   {
//     id: "PAY-2025-0002",
//     user: {
//       name: "Alice Smith",
//       email: "alice@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "pending",
//     amount: 950,
//     commission: 150,
//   },
//   {
//     id: "PAY-2025-0003",
//     user: {
//       name: "Bob Johnson",
//       email: "bob@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "completed",
//     amount: 1800,
//     commission: 300,
//   },
//   {
//     id: "PAY-2025-0004",
//     user: {
//       name: "Clara Evans",
//       email: "clara.evans@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "completed",
//     amount: 1800,
//     commission: 300,
//   },
//   {
//     id: "PAY-2025-0005",
//     user: {
//       name: "David Lee",
//       email: "david.lee@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "pending",
//     amount: 750,
//     commission: 125,
//   },
//   {
//     id: "PAY-2025-0006",
//     user: {
//       name: "Emma Watson",
//       email: "emma.watson@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "refunded",
//     amount: 620,
//     commission: 100,
//   },
//   {
//     id: "PAY-2025-0007",
//     user: {
//       name: "Frank Miller",
//       email: "frank.miller@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "completed",
//     amount: 2100,
//     commission: 350,
//   },
//   {
//     id: "PAY-2025-0008",
//     user: {
//       name: "Grace Kim",
//       email: "grace.kim@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "blocked",
//     amount: 400,
//     commission: 80,
//   },
//   {
//     id: "PAY-2025-0009",
//     user: {
//       name: "Henry Cooper",
//       email: "henry.cooper@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "pending",
//     amount: 1300,
//     commission: 200,
//   },
//   {
//     id: "PAY-2025-0010",
//     user: {
//       name: "Isabella Reed",
//       email: "isabella.reed@example.com",
//       avatar: venuphoto1.src,
//     },
//     status: "refunded",
//     amount: 1650,
//     commission: 275,
//   },
// ];

// // Columns definition
// export const getColumns = (
//   _setStatusFilter: (status: PaymentStatus | null) => void,
//   statusFilterDropdown: React.ReactNode
// ): ColumnDef<UserPayment>[] => [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//         className="border-gray-300"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//         className="border-gray-300"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "user",
//     header: "User Info",
//     cell: ({ row }) => {
//       const user = row.original.user;
//       return (
//         <div className="flex items-center space-x-3">
//           <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
//             <Image
//               src={user.avatar}
//               alt={user.name}
//               width={40}
//               height={40}
//               className="object-cover"
//             />
//           </div>
//           <div>
//             <div className="font-medium text-gray-900">{user.name}</div>
//             <div className="text-xs text-gray-500">{user.email}</div>
//           </div>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "status",
//     header: () => statusFilterDropdown,
//     cell: ({ row }) => {
//       const status = row.getValue("status") as PaymentStatus;
//       const config = STATUS_CONFIG[status];

//       return (
//         <span
//           className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.textColor}`}
//         >
//           {config.text}
//         </span>
//       );
//     },
//     filterFn: (row, id, value) => {
//       return value.includes(row.getValue(id));
//     },
//   },
//   {
//     accessorKey: "amount",
//     header: () => <div className="text-right">Amount</div>,
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue("amount"));
//       const formatted = new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "USD",
//       }).format(amount);

//       return (
//         <div className="text-right font-medium text-gray-900">{formatted}</div>
//       );
//     },
//   },
//   {
//     accessorKey: "commission",
//     header: () => <div className="text-right">Commission</div>,
//     cell: ({ row }) => {
//       const commission = parseFloat(row.getValue("commission"));
//       const formatted = new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "USD",
//       }).format(commission);

//       return <div className="text-right text-gray-700">{formatted}</div>;
//     },
//   },
//   {
//     id: "actions",
//     header: () => <div className="text-center">Actions</div>,
//     cell: ({ row }) => (
//       <div className="flex justify-center space-x-2">
//         <Link
//           href={`/admin/all-payment/details/${row.original.id}`}
//           className="text-indigo-600 hover:text-indigo-900 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors"
//         >
//           View Details
//         </Link>
//       </div>
//     ),
//   },
// ];

// // Main component
// export function AllPayment() {
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//     []
//   );
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = React.useState({});
//   const [statusFilter, setStatusFilter] = React.useState<PaymentStatus | null>(
//     null
//   );
//   const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);

//   const filteredData = React.useMemo(() => {
//     if (!statusFilter) return data;
//     return data.filter((item) => item.status === statusFilter);
//   }, [statusFilter]);

//   const statusFilterDropdown = (
//     <div className="relative inline-block text-left">
//       <button
//         type="button"
//         onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
//         className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 border border-gray-300"
//       >
//         <span className="whitespace-nowrap">
//           Status:{" "}
//           <span className="font-semibold text-gray-800">
//             {statusFilter ? STATUS_CONFIG[statusFilter].text : "All"}
//           </span>
//         </span>
//         <IoChevronDown
//           className={`h-4 w-4 text-gray-500 transition-transform ${
//             statusDropdownOpen ? "rotate-180" : ""
//           }`}
//         />
//       </button>

//       {statusDropdownOpen && (
//         <div className="absolute left-0 z-10 mt-2 w-44 origin-top-left rounded-md border border-gray-200 bg-white shadow-lg">
//           <div className="py-1 text-sm text-gray-700">
//             <div
//               className={`px-4 py-1.5 cursor-pointer rounded-sm ${
//                 !statusFilter
//                   ? "bg-indigo-50 text-indigo-700 font-medium"
//                   : "hover:bg-gray-100"
//               }`}
//               onClick={() => {
//                 setStatusFilter(null);
//                 setStatusDropdownOpen(false);
//               }}
//             >
//               All Statuses
//             </div>
//             {Object.entries(STATUS_CONFIG).map(([status, config]) => (
//               <div
//                 key={status}
//                 className={`px-4 py-1.5 cursor-pointer rounded-sm ${
//                   statusFilter === status
//                     ? "bg-indigo-50 text-indigo-700 font-medium"
//                     : "hover:bg-gray-100"
//                 }`}
//                 onClick={() => {
//                   setStatusFilter(status as PaymentStatus);
//                   setStatusDropdownOpen(false);
//                 }}
//               >
//                 {config.text}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   const columns = React.useMemo(
//     () => getColumns(setStatusFilter, statusFilterDropdown),
//     [statusFilterDropdown]
//   );

//   const table = useReactTable({
//     data: filteredData,
//     columns,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//     },
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   });

//   return (
//     <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
//       <div className="overflow-x-auto">
//         <Table className="min-w-full divide-y divide-gray-200">
//           <TableHeader className="bg-gray-50">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <TableHead
//                     key={header.id}
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody className="bg-white divide-y divide-gray-200">
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow key={row.id} className="hover:bg-gray-50">
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell
//                       key={cell.id}
//                       className="px-6 py-4 whitespace-nowrap"
//                     >
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="px-6 py-4 text-center text-gray-500"
//                 >
//                   No payments found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }
