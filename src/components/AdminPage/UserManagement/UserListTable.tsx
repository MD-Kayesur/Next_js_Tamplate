// src/components/UserListTable.tsx
"use client";

import React from "react";
import Image from "next/image";
import { IoChevronDown, IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useGetUsersQuery, useDeleteUserMutation } from "@/redux/features/auth/userApi";
import { toast } from "sonner";

import { setSearchTerm, setRoleFilter } from "@/redux/features/auth/userSlice";

import defaultUserPhoto from "@/assets/images/profile.png";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import PageLoader from "../Shared/PageLoader";

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photo: string | null;
  role: "USER" | "ADMIN";
  isSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
}

const StatusBadge = ({ status }: { status: boolean }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    }`}
  >
    <span
      className={`w-2 h-2 rounded-full mr-1.5 ${
        status ? "bg-green-500" : "bg-gray-500"
      }`}
    />
    {status ? "Active" : "Inactive"}
  </span>
);

const RoleBadge = ({ role }: { role: User["role"] }) => {
  const roleStyles = {
    USER: "bg-blue-100 text-blue-800",
    ADMIN: "bg-purple-100 text-purple-800",
    // SUPER_ADMIN: "bg-indigo-100 text-indigo-800",
  };

  const roleText = {
    USER: "User",
    ADMIN: "Admin",
    // SUPER_ADMIN: "Super Admin",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        roleStyles[role] || "bg-gray-100 text-gray-800"
      }`}
    >
      {roleText[role] || role}
    </span>
  );
};

const DeleteUserButton = ({ user }: { user: User }) => {
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleDelete = async () => {
    try {
      // Use userId if it exists in the user object, otherwise use id
      const userIdToDelete = (user as any).userId || user.id;
      await deleteUser(userIdToDelete).unwrap();
      toast.success(`User ${user.fullName} has been permanently deleted`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Button
        size="sm"
        variant="destructive"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 px-3 text-xs cursor-pointer flex items-center gap-1"
      >
        <MdDelete className="h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
};

const RoleFilter = () => {
  const [open, setOpen] = React.useState(false);
  const roleFilter = useAppSelector((state) => state.user.roleFilter);
  const dispatch = useAppDispatch();

  const options = [
    { label: "All", value: null },
    { label: "User", value: "USER" },
    // Admin option removed since admin users are filtered out from the list
    // { label: "Super Admin", value: "SUPER_ADMIN" },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-gray-700 hover:bg-gray-100 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span>
          {options.find((opt) => opt.value === roleFilter)?.label ||
            "All Roles"}
        </span>
        <IoChevronDown className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute z-10 mt-1 w-40 rounded-md bg-white shadow-lg border border-gray-200">
          {options.map((option) => (
            <button
              key={option.label}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                roleFilter === option.value ? "bg-gray-100 font-medium" : ""
              }`}
              onClick={() => {
                dispatch(setRoleFilter(option.value));
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      console.log("User:", user);
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image
              src={user.photo || defaultUserPhoto}
              alt={user.fullName}
              fill
              className="rounded-full object-cover border border-gray-200"
              sizes="40px"
            />
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "phoneNumber",
  //   header: "Phone",
  //   cell: ({ row }) => (
  //     <div className="text-gray-700">
  //       {/* {row.getValue("phoneNumber") || "N/A"} */}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "role",
    header: () => <div className="text-left">Role</div>,
    cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
  },
  // {
  //   accessorKey: "isSubscribed",
  //   header: "Status",
  //   cell: ({ row }) => <StatusBadge status={row.getValue("isSubscribed")} />,
  // },
  {
    accessorKey: "createdAt",
    header: "Joined Date",
    cell: ({ row }) => (
      <div className="text-gray-700">
        {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => <DeleteUserButton user={row.original} />,
  },
];

export function UserListTable() {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.user.searchTerm);
  const roleFilter = useAppSelector((state) => state.user.roleFilter);

  // Fetch users from API
  const { data: users = [], isLoading, isError } = useGetUsersQuery(undefined);

  console.log("Users data:", users);

  const filteredData = React.useMemo(() => {
    // Filter out admin users - only show users with role "USER" (case-insensitive check)
    let result = users.filter((user: User) => {
      const userRole = user.role?.toUpperCase();
      // Exclude both "ADMIN" and any case variation
      return userRole !== "ADMIN";
    });
    
    if (roleFilter) {
      result = result.filter((user: User) => user.role === roleFilter);
    }
    if (searchTerm) {
      const lowerFilter = searchTerm.toLowerCase();
      result = result.filter(
        (user: User) =>
          user.fullName.toLowerCase().includes(lowerFilter) ||
          user.email.toLowerCase().includes(lowerFilter) ||
          (user.phoneNumber &&
            user.phoneNumber.toLowerCase().includes(lowerFilter))
      );
    }
    return result;
  }, [users, roleFilter, searchTerm]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: (value) => dispatch(setSearchTerm(value)),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <PageLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">Error loading users</div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearch className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="Search users..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
          </div>
          <RoleFilter />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4">
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
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
              filteredData.length
            )}
          </span>{" "}
          of <span className="font-medium">{filteredData.length}</span> users
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

// import React from "react";
// import Image from "next/image";
// import { IoChevronDown, IoSearch } from "react-icons/io5";
// import {
//   useReactTable,
//   ColumnDef,
//   getCoreRowModel,
//   flexRender,
//   getFilteredRowModel,
//   getPaginationRowModel,
// } from "@tanstack/react-table";

// import defaultUserPhoto from "@/assets/images/profile.png";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// type User = {
//   id: string;
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   photo: string | null;
//   role: string;
//   isSubscribed: boolean;
//   createdAt: string;
//   updatedAt: string;
// };

// const StatusBadge = ({ status }: { status: boolean }) => (
//   <span
//     className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//       status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
//     }`}
//   >
//     <span
//       className={`w-2 h-2 rounded-full mr-1.5 ${
//         status ? "bg-green-500" : "bg-gray-500"
//       }`}
//     />
//     {status ? "Active" : "Inactive"}
//   </span>
// );

// const RoleBadge = ({ role }: { role: string }) => {
//   const roleStyles = {
//     USER: "bg-blue-100 text-blue-800",
//     ADMIN: "bg-purple-100 text-purple-800",
//     SUPER_ADMIN: "bg-indigo-100 text-indigo-800",
//   };

//   const roleText = {
//     USER: "User",
//     ADMIN: "Admin",
//     SUPER_ADMIN: "Super Admin",
//   };

//   return (
//     <span
//       className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
//         roleStyles[role as keyof typeof roleStyles] ||
//         "bg-gray-100 text-gray-800"
//       }`}
//     >
//       {roleText[role as keyof typeof roleText] || role}
//     </span>
//   );
// };

// const RoleFilter = ({
//   value,
//   onChange,
// }: {
//   value: string | null;
//   onChange: (value: string | null) => void;
// }) => {
//   const [open, setOpen] = React.useState(false);
//   const options = ["All", "User", "Admin", "Super Admin"];

//   return (
//     <div className="relative">
//       <Button
//         variant="ghost"
//         size="sm"
//         className="flex items-center gap-1 text-gray-700 hover:bg-gray-100 cursor-pointer"
//         onClick={() => setOpen(!open)}
//       >
//         <span>{value ? value : "All Roles"}</span>
//         <IoChevronDown className="h-4 w-4" />
//       </Button>
//       {open && (
//         <div className="absolute z-10 mt-1 w-40 rounded-md bg-white shadow-lg border border-gray-200">
//           {options.map((option) => (
//             <button
//               key={option}
//               className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
//                 (!value && option === "All") || value === option
//                   ? "bg-gray-100 font-medium"
//                   : ""
//               }`}
//               onClick={() => {
//                 onChange(option === "All" ? null : option.toUpperCase());
//                 setOpen(false);
//               }}
//             >
//               {option}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const columns: ColumnDef<User>[] = [
//   {
//     accessorKey: "fullName",
//     header: "User",
//     cell: ({ row }) => {
//       const user = row.original;
//       return (
//         <div className="flex items-center gap-3">
//           <div className="relative h-10 w-10 flex-shrink-0">
//             <Image
//               src={user.photo || defaultUserPhoto}
//               alt={user.fullName}
//               fill
//               className="rounded-full object-cover border border-gray-200"
//             />
//           </div>
//           <div>
//             <div className="font-medium text-gray-900">{user.fullName}</div>
//             <div className="text-sm text-gray-500">{user.email}</div>
//           </div>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "phoneNumber",
//     header: "Phone",
//     cell: ({ row }) => (
//       <div className="text-gray-700">
//         {row.getValue("phoneNumber") || "N/A"}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "role",
//     header: () => <div className="text-left">Role</div>,
//     cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
//   },
//   {
//     accessorKey: "isSubscribed",
//     header: "Status",
//     cell: ({ row }) => <StatusBadge status={row.getValue("isSubscribed")} />,
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Joined Date",
//     cell: ({ row }) => (
//       <div className="text-gray-700">
//         {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         })}
//       </div>
//     ),
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => (
//       <Button
//         variant="outline"
//         size="sm"
//         className="text-gray-700 hover:bg-gray-50 cursor-pointer"
//         onClick={() => {
//           // Handle view details
//           console.log("View user:", row.original.id);
//         }}
//       >
//         View
//       </Button>
//     ),
//   },
// ];

// export function UserListTable() {
//   const [globalFilter, setGlobalFilter] = React.useState("");
//   const [roleFilter, setRoleFilter] = React.useState<string | null>(null);

//   // Your existing data
//   const data = React.useMemo(
//     () => [
//       {
//         id: "93db3beb-4945-45db-9693-3ac711e14e06",
//         fullName: "John Doe",
//         email: "johndoe@example.com",
//         phoneNumber: "+1234-56789",
//         photo: null,
//         role: "USER",
//         isSubscribed: false,
//         createdAt: "2025-06-17T06:02:05.060Z",
//         updatedAt: "2025-06-17T06:02:05.060Z",
//       },
//       {
//         id: "a2c4e6g8-i0k2-m4n6-p8q0-s2u4w6y8z0a",
//         fullName: "Jane Smith",
//         email: "jane.smith@example.com",
//         phoneNumber: "+8809876543210",
//         photo: null,
//         role: "ADMIN",
//         isSubscribed: true,
//         createdAt: "2025-05-15T10:30:00.000Z",
//         updatedAt: "2025-06-10T08:45:22.123Z",
//       },
//       {
//         id: "b3d5f7h9-j1l3-o5p7-r9s1-t3v5x7y9z1b",
//         fullName: "Michael Johnson",
//         email: "michael.j@example.com",
//         phoneNumber: "+8801122334455",
//         photo: null,
//         role: "USER",
//         isSubscribed: true,
//         createdAt: "2025-04-20T14:15:33.456Z",
//         updatedAt: "2025-06-05T11:20:15.789Z",
//       },
//       {
//         id: "c4e6g8i0-k2m4-n6o8-q0r2-s4t6v8x0z2c",
//         fullName: "Sarah Williams",
//         email: "sarah.w@example.com",
//         phoneNumber: "+8805566778899",
//         photo: null,
//         role: "SUPER_ADMIN",
//         isSubscribed: false,
//         createdAt: "2025-03-10T09:05:17.890Z",
//         updatedAt: "2025-06-18T07:30:45.678Z",
//       },
//       {
//         id: "d5f7h9j1-l3m5-o7p9-r1t3-u5v7x9y1z3d",
//         fullName: "Robert Brown",
//         email: "robert.b@example.com",
//         phoneNumber: "+8809988776655",
//         photo: null,
//         role: "USER",
//         isSubscribed: true,
//         createdAt: "2025-02-28T16:40:22.345Z",
//         updatedAt: "2025-06-15T13:25:10.234Z",
//       },
//       {
//         id: "e6g8i0k2-m4n6-p8q0-s2u4-w6y8z0a2b4e",
//         fullName: "Emily Davis",
//         email: "emily.d@example.com",
//         phoneNumber: "+8803344556677",
//         photo: null,
//         role: "ADMIN",
//         isSubscribed: false,
//         createdAt: "2025-01-15T11:20:05.567Z",
//         updatedAt: "2025-06-12T09:15:30.456Z",
//       },
//       {
//         id: "f7h9j1l3-n5o7-q9r1-t3v5-x7y9z1b3d5f",
//         fullName: "David Wilson",
//         email: "david.w@example.com",
//         phoneNumber: "+8806677889900",
//         photo: null,
//         role: "USER",
//         isSubscribed: true,
//         createdAt: "2024-12-05T08:10:44.678Z",
//         updatedAt: "2025-06-08T10:05:20.345Z",
//       },
//       {
//         id: "g8i0k2m4-o6p8-r0s2-t4v6-x8y0z2b4d6g",
//         fullName: "Jennifer Taylor",
//         email: "jennifer.t@example.com",
//         phoneNumber: "+8802233445566",
//         photo: null,
//         role: "USER",
//         isSubscribed: false,
//         createdAt: "2024-11-20T13:25:15.789Z",
//         updatedAt: "2025-06-01T14:30:25.123Z",
//       },
//     ],
//     []
//   );

//   const filteredData = React.useMemo(() => {
//     let result = data;
//     if (roleFilter) {
//       result = result.filter((user) => user.role === roleFilter);
//     }
//     if (globalFilter) {
//       const lowerFilter = globalFilter.toLowerCase();
//       result = result.filter(
//         (user) =>
//           user.fullName.toLowerCase().includes(lowerFilter) ||
//           user.email.toLowerCase().includes(lowerFilter) ||
//           user.phoneNumber.toLowerCase().includes(lowerFilter)
//       );
//     }
//     return result;
//   }, [data, roleFilter, globalFilter]);

//   const table = useReactTable({
//     data: filteredData,
//     columns,
//     state: {
//       globalFilter,
//     },
//     onGlobalFilterChange: setGlobalFilter,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     initialState: {
//       pagination: {
//         pageSize: 6, // Show 6 users per page
//       },
//     },
//   });

//   return (
//     <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
//       <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
//         <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
//           <div className="relative w-full sm:w-64">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <IoSearch className="h-5 w-5 text-gray-400" />
//             </div>
//             <Input
//               placeholder="Search users..."
//               className="pl-10 w-full"
//               value={globalFilter}
//               onChange={(e) => setGlobalFilter(e.target.value)}
//             />
//           </div>
//           <RoleFilter value={roleFilter} onChange={setRoleFilter} />
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader className="bg-gray-50">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <TableHead
//                     key={header.id}
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     {flexRender(
//                       header.column.columnDef.header,
//                       header.getContext()
//                     )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow key={row.id} className="hover:bg-gray-50">
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id} className="px-6 py-4">
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
//                   No users found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//         <div className="text-sm text-gray-700">
//           Showing{" "}
//           <span className="font-medium">
//             {table.getState().pagination.pageIndex *
//               table.getState().pagination.pageSize +
//               1}
//           </span>{" "}
//           to{" "}
//           <span className="font-medium">
//             {Math.min(
//               (table.getState().pagination.pageIndex + 1) *
//                 table.getState().pagination.pageSize,
//               filteredData.length
//             )}
//           </span>{" "}
//           of <span className="font-medium">{filteredData.length}</span> users
//         </div>
//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//             className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
//             style={{
//               backgroundColor: !table.getCanPreviousPage() ? "white" : "white",
//               color: "#2D0954",
//               borderColor: "#2D0954",
//             }}
//           >
//             Previous
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//             className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
//             style={{
//               backgroundColor: !table.getCanNextPage() ? "white" : "white",
//               color: "#2D0954",
//               borderColor: "#2D0954",
//             }}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import React from "react";
// import Image from "next/image";
// import { IoChevronDown } from "react-icons/io5";
// import {
//   useReactTable,
//   ColumnDef,
//   getCoreRowModel,
//   flexRender,
// } from "@tanstack/react-table";

// import venuphoto1 from "@/assets/images/venuphoto1.png";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { useGetAllVenuesQuery } from "@/redux/features/venue/venueApi";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import { setFilterStatus } from "@/redux/features/venue/venueSlice";
// import { Venue } from "@/redux/types/venue.type";

// // Status filter dropdown component
// const StatusHeader: React.FC<{
//   setStatusFilter: (status: string | null) => void;
//   currentStatus: string | null;
// }> = ({ setStatusFilter, currentStatus }) => {
//   const [open, setOpen] = React.useState(false);
//   const statusOptions = ["All", "Active", "Hold", "Suspend"];

//   return (
//     <div className="relative inline-block text-left">
//       <button
//         onClick={() => setOpen((prev) => !prev)}
//         className="flex items-center gap-1 font-medium text-sm text-gray-800 hover:text-black"
//       >
//         <span>
//           {currentStatus
//             ? statusOptions.find(
//                 (opt) => opt.toUpperCase() === currentStatus
//               ) || "Status"
//             : "Status"}
//         </span>
//         <IoChevronDown />
//       </button>
//       {open && (
//         <div className="absolute mt-2 w-40 bg-white border rounded shadow z-10">
//           {statusOptions.map((option) => (
//             <div
//               key={option}
//               onClick={() => {
//                 setStatusFilter(option === "All" ? null : option.toUpperCase());
//                 setOpen(false);
//               }}
//               className="px-4 py-2 hover:bg-gray-100 cursor-pointer capitalize"
//             >
//               {option}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const statusMap = {
//   ACTIVE: { text: "Active", color: "bg-green-500" },
//   HOLD: { text: "Hold", color: "bg-yellow-500" },
//   SUSPEND: { text: "Suspend", color: "bg-red-500" },
// };

// // Define column structure
// const getColumns = (
//   setStatusFilter: (status: string | null) => void,
//   currentStatus: string | null
// ): ColumnDef<Venue>[] => [
//   {
//     accessorKey: "name",
//     header: () => <span className="font-semibold ">Venue Name</span>,
//     cell: ({ row }) => {
//       const name = row.getValue("name") as string;
//       const imageSrc = row.original.coverImage || venuphoto1.src;

//       return (
//         <div className="flex items-center gap-3">
//           <Image
//             src={imageSrc}
//             alt={name}
//             width={40}
//             height={40}
//             className="rounded w-[40px] h-[40px] object-cover"
//           />
//           <span className="font-semibold">{name}</span>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "status",
//     header: () => (
//       <StatusHeader
//         setStatusFilter={setStatusFilter}
//         currentStatus={currentStatus}
//       />
//     ),
//     cell: ({ row }) => {
//       const status = row.getValue("status") as keyof typeof statusMap;
//       const { text, color } = statusMap[status] || {
//         text: "Unknown",
//         color: "bg-gray-400",
//       };
//       return (
//         <div className="flex items-center gap-2">
//           <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
//           <span className="capitalize cursor-pointer">{text}</span>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "address",
//     header: () => <span className="font-semibold">Address</span>,
//     cell: ({ row }) => <span>{row.getValue("address") || "N/A"}</span>,
//   },
//   {
//     accessorKey: "totalEarning",
//     header: () => <div className="text-right font-semibold">Total Earning</div>,
//     cell: ({ row }) => {
//       const val = Number(row.getValue("totalEarning")) || 0;
//       return <div className="text-right font-medium">${val.toFixed(2)}</div>;
//     },
//   },
//   {
//     accessorKey: "commission",
//     header: () => <div className="text-right font-semibold">Commission</div>,
//     cell: ({ row }) => {
//       const val = Number(row.getValue("commission")) || 0;
//       return <div className="text-right font-medium">${val.toFixed(2)}</div>;
//     },
//   },
//   {
//     id: "details",
//     cell: ({ row }) => (
//       <div className="flex justify-end">
//         <a
//           href={`/admin/user-management/${row.original.id}`}
//           className="text-blue-600 underline text-sm"
//         >
//           Details
//         </a>
//       </div>
//     ),
//   },
// ];
// console.log(
//   "Venue Data:",
//   getColumns((status) => console.log("Set status:", status), "ACTIVE")
// );

// export function UserListTable() {
//   const dispatch = useAppDispatch();
//   const filterStatus = useAppSelector((state) => state.venue.filterStatus);

//   const { data, isLoading, isError } = useGetAllVenuesQuery(
//     filterStatus ? { status: filterStatus } : {}
//   );
//   console.log("Fetching venues with status:", data);

//   const venueList: Venue[] = React.useMemo(() => data || [], [data]);

//   const table = useReactTable({
//     data: venueList,
//     columns: getColumns(
//       (status) => dispatch(setFilterStatus(status)),
//       filterStatus
//     ),
//     getCoreRowModel: getCoreRowModel(),
//   });

//   if (isLoading) return <div className="text-center p-4">Loading...</div>;
//   if (isError)
//     return (
//       <div className="text-center p-4 text-red-500">Error loading data</div>
//     );

//   return (
//     <div className="p-4 bg-white rounded shadow">
//       <Table>
//         <TableHeader>
//           {table.getHeaderGroups().map((headerGroup) => (
//             <TableRow key={headerGroup.id}>
//               {headerGroup.headers.map((header) => (
//                 <TableHead key={header.id}>
//                   {flexRender(
//                     header.column.columnDef.header,
//                     header.getContext()
//                   )}
//                 </TableHead>
//               ))}
//             </TableRow>
//           ))}
//         </TableHeader>
//         <TableBody>
//           {table.getRowModel().rows.length ? (
//             table.getRowModel().rows.map((row) => (
//               <TableRow key={row.id}>
//                 {row.getVisibleCells().map((cell) => (
//                   <TableCell key={cell.id}>
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={6} className="text-center text-gray-500">
//                 No venues found.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }

/* 
"use client";

import venuphoto1 from "@/assets/images/venuphoto1.png";
import * as React from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { IoChevronDown } from "react-icons/io5";

export type Venue = {
  id: string;
  venueName: string;
  status: "active" | "hold" | "suspend";
  address: string;
  totalEarning: number;
  commission: number;
  photo: string;
  coverImage?: string; // Added coverImage property
};

const data: Venue[] = [
  {
    id: "v001",
    venueName: "The Grand Hall",
    status: "active",
    address: "123 Main St, NY",
    totalEarning: 1200,
    commission: 200,
    photo: venuphoto1.src,
  },
  {
    id: "v002",
    venueName: "Ocean View Hall",
    status: "hold",
    address: "456 Ocean Dr, CA",
    totalEarning: 950,
    commission: 150,
    photo: venuphoto1.src,
  },
  {
    id: "v003",
    venueName: "Garden Plaza",
    status: "suspend",
    address: "789 Garden Rd, TX",
    totalEarning: 0,
    commission: 0,
    photo: venuphoto1.src,
  },
  {
    id: "v004",
    venueName: "Skyline Event Center",
    status: "active",
    address: "101 Sky Blvd, LA",
    totalEarning: 5000,
    commission: 800,
    photo: venuphoto1.src,
  },
  {
    id: "v005",
    venueName: "City Lights Ballroom",
    status: "active",
    address: "202 City Ave, NY",
    totalEarning: 3500,
    commission: 500,
    photo: venuphoto1.src,
  },
  {
    id: "v006",
    venueName: "Riverfront Conference Hall",
    status: "hold",
    address: "303 River Rd, FL",
    totalEarning: 1300,
    commission: 250,
    photo: venuphoto1.src,
  },
  {
    id: "v007",
    venueName: "Mountain Retreat",
    status: "active",
    address: "404 Hilltop Ln, CO",
    totalEarning: 2100,
    commission: 350,
    photo: venuphoto1.src,
  },
  {
    id: "v008",
    venueName: "Sunset Pavilion",
    status: "suspend",
    address: "505 Sunset Blvd, NV",
    totalEarning: 0,
    commission: 0,
    photo: venuphoto1.src,
  },
  {
    id: "v009",
    venueName: "The Royal Palace",
    status: "active",
    address: "606 Palace Rd, MA",
    totalEarning: 8500,
    commission: 1200,
    photo: venuphoto1.src,
  },
];

const StatusHeader: React.FC<{
  setStatusFilter: (status: string | null) => void;
}> = ({ setStatusFilter }) => {
  const [open, setOpen] = React.useState(false);
  const statusOptions = ["All", "Active", "Hold", "Suspend"];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 font-medium text-sm text-gray-800 hover:text-black focus:outline-none"
      >
        <span>Status</span>
        <IoChevronDown className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1 text-sm text-gray-700">
            {statusOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setStatusFilter(
                    option === "All" ? null : option.toLowerCase()
                  );
                  setOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const getColumns = (
  setStatusFilter: (status: string | null) => void
): ColumnDef<Venue>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="cursor-pointer"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "venueName",
    header: "Venue Name",
    cell: ({ row }) => {
      const venueName = row.getValue("venueName") as string;
      const venuePhotoUrl = row.original.photo;
      return (
        <div className="flex items-center space-x-3 ">
          <Image
            src={venuePhotoUrl}
            alt={venueName}
            className="w-10 h-10 object-cover rounded "
            width={40}
            height={40}
          />
          <span className="font-medium ">{venueName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <StatusHeader setStatusFilter={setStatusFilter} />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusMap: Record<string, { text: string; color: string }> = {
        active: { text: "Active", color: "bg-green-500" },
        hold: { text: "Hold", color: "bg-yellow-500" },
        suspend: { text: "Suspend", color: "bg-red-500" },
      };
      const { text, color } = statusMap[status] || {
        text: "Unknown",
        color: "bg-gray-500",
      };
      return (
        <div className="flex items-center gap-2 cursor-pointer">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
          <span className="capitalize text-sm font-medium">{text}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => <div>{row.getValue("address")}</div>,
  },
  {
    accessorKey: "totalEarning",
    header: () => <div className="text-right">Total Earning</div>,
    cell: ({ row }) => {
      const amount = row.getValue("totalEarning") as number;
      return (
        <div className="text-right font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "commission",
    header: () => <div className="text-right">Commission</div>,
    cell: ({ row }) => {
      const amount = row.getValue("commission") as number;
      return (
        <div className="text-right font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)}
        </div>
      );
    },
  },
  {
    id: "details",
    cell: ({ row }) => (
      <ul>
        <div className="flex justify-end">
          <a
            href={`/admin/user-management/${row.original.id}`}
            className="text-[var(--color-accent)] underline cursor-pointer w-[44px] h-[16px] font-roboto font-medium text-[14px] leading-[14px] flex items-center justify-end"
          >
            Details
          </a>
        </div>
      </ul>
    ),
  },
];

export function UserListTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  const filteredData = React.useMemo(() => {
    if (!statusFilter) return data;
    return data.filter((venue) => venue.status === statusFilter);
  }, [statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns: getColumns(setStatusFilter),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between py-4">
        <h3 className="text-lg ml-4 font-semibold text-roboto text-[14px] leading-[100%] tracking-[0px] align-middle">
          All Venue List
        </h3>
      </div>

      <div className="rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell colSpan={7} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
 */
