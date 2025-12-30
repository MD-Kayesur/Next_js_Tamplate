"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdDashboard, MdOutlinePayments } from "react-icons/md";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";
import { TbLogout } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";

import { HiOutlineMenuAlt2 } from "react-icons/hi";
import logo from "../../../assets/logo/path.png";
import profile from "../../../assets/images/profile.png";
import logo2 from "../../../assets/logo/Logo2.svg";
import { cn } from "@/lib/utils";
import AdminNavBar from "@/components/AdminPage/Shared/AdminNavBar";
import { useAppDispatch } from "@/redux/hooks/redux-hook";
import { logOut } from "@/redux/features/auth/authSlice";
import cookies from "js-cookie";
import { toast } from "sonner";
import { FaUserGroup } from "react-icons/fa6";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: MdDashboard },
  {
    title: "All Users ",
    href: "/admin/user-management",
    icon: FaUserGroup,
  },
  {
    title: "All Payment",
    href: "/admin/all-payment",
    icon: MdOutlinePayments,
  },
  {
    title: "Subscription Plans",
    href: "/admin/subscription-plan",
    icon: IoSettingsOutline,
  },
  {
    title: "Admin Profile",
    href: "/admin/admin-profile",
    icon:  CgProfile ,
  },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setIsMobile] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    cookies.remove("token");
    dispatch(logOut());
    toast.success("Admin Logged out successfully!");
    router.push("/");
  };

  const hideNavBar =
    pathname === "/admin/active-user-details" ||
    pathname === "/admin/user-payment" ||
    pathname === "/admin/memnoy-refund/" ||
    pathname.startsWith("/admin/all-payment/") ||
    pathname.startsWith("/admin/memnoy-refund") ||
    pathname.startsWith("/admin/user-management/");

  return (
    <div className="flex flex-col min-h-screen bg-[#092B1F] font-Robot">
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Sidebar for Desktop */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 80 : 296 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-20 bg-[#092B1F] dark:bg-gray-900 shadow-md p-4"
        >
          <div className="flex items-center justify-between mb-6 h-[48px]">
            <div className="flex items-center gap-2">
              {collapsed ? (
                <Image
                  src={logo}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-full"
                />
              ) : (
                <div className=" ">
                  <Image src={logo2} alt="Logo" className="w-50 h-full" />
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-3xl text-white hover:bg-[#2A62DF]  p-1 rounded-full transition-colors cursor-pointer"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <RiArrowRightSLine /> : <RiArrowLeftSLine />}
            </button>
          </div>

          <nav className="flex-grow space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-4 px-[14px] py-3 rounded-lg transition-all",
                  pathname.startsWith(item.href)
                    ? "bg-[#0e6a4a] text-white shadow-sm"
                    : "hover:bg-[#0e6a4a] text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    pathname.startsWith(item.href) ? "text-white" : "text-white"
                  )}
                />
                {!collapsed && (
                  <span
                    className={cn(
                      "font-medium text-[16px] transition-colors",
                      pathname.startsWith(item.href)
                        ? "text-white"
                        : "text-white"
                    )}
                  >
                    {item.title}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto mb-4">
            <button
              onClick={handleLogout}
              className={cn(
                "group flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#3A1A6A] text-white cursor-pointer",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <TbLogout className="h-5 w-5 text-red-400" />
              {!collapsed && (
                <span className="text-sm font-medium text-white">Log Out</span>
              )}
            </button>
          </div>
        </motion.aside>

        {/* Mobile Topbar */}
        <header className="md:hidden sticky top-0 z-20 bg-[#2D0954] shadow-sm flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 rounded-md hover:bg-[#3A1A6A] cursor-pointer"
              aria-label="Open menu"
            >
              <HiOutlineMenuAlt2 className="h-6 w-6 text-white" />
            </button>
            {/* <div className="flex items-center gap-2">
              <Image src={logo} alt="Logo" width={32} height={32} />
              <h1 className="text-xl font-bold bg-gradient-to-b from-[#408DF0] to-[#0E579E]  bg-clip-text text-white">
               Great2d
              </h1>
            </div> */}
          </div>

          <button className="p-1" onClick={() => setMobileMenuOpen(true)}>
            <Image
              src={profile}
              alt="Profile"
              width={36}
              height={36}
              className="rounded-full border-2 border-[#3A1A6A]"
            />
          </button>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-40 w-72 bg-[#2D0954] shadow-xl overflow-y-auto"
              >
                <div className="flex flex-col h-full p-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Image
                        src={logo}
                        alt="Logo"
                        width={44}
                        height={44}
                        className=" rounded-xl"
                      />
                      <h1 className="text-2xl font-bold bg-gradient-to-b from-[#408DF0] to-[#0E579E]  bg-clip-text text-white">
                        Great2d
                      </h1>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 rounded-full hover:bg-[#3A1A6A] cursor-pointer"
                      aria-label="Close menu"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-[#3A1A6A]">
                    <Image
                      src={profile}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-[#3A1A6A]"
                    />
                    <div>
                      <p className="font-medium text-white">Admin Panel</p>
                      <p className="text-sm text-gray-300">Administrator</p>
                    </div>
                  </div>

                  <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                          pathname.startsWith(item.href)
                            ? "bg-[#2A62DF] text-white"
                            : "hover:bg-[#3A1A6A] text-white"
                        )}
                      >
                        <item.icon className="h-5 w-5 text-white" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    ))}
                  </nav>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-3 mt-4 rounded-lg hover:bg-[#3A1A6A] text-white cursor-pointer"
                  >
                    <TbLogout className="h-5 w-5 text-red-400" />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 bg-[#F4F4F4] overflow-y-auto transition-all duration-300",
            collapsed ? "md:ml-[80px]" : "md:ml-[296px]"
          )}
        >
          {!hideNavBar && (
            <div className="hidden md:block sticky top-0 z-10">
              <AdminNavBar />
            </div>
          )}
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// import { MdDashboard } from "react-icons/md";
// import { FaRegUser } from "react-icons/fa6";
// import { PiBuildingApartmentFill } from "react-icons/pi";
// import { SlCalender } from "react-icons/sl";
// import { SiSimpleanalytics } from "react-icons/si";
// import {
//   RiSupabaseLine,
//   RiArrowLeftSLine,
//   RiArrowRightSLine,
// } from "react-icons/ri";
// import { IoSettingsOutline } from "react-icons/io5";
// import { TbLogout } from "react-icons/tb";

// import logo from "../../../assets/icon/logo1.png";
// import profile from "../../../assets/images/profile.png";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import AdminNavBar from "@/components/AdminPage/Shared/AdminNavBar";
// import { useAppDispatch } from "@/redux/hooks/redux-hook";
// import { logOut } from "@/redux/features/auth/authSlice";
// import cookies from "js-cookie";
// import { toast } from "sonner";
// interface NavItem {
//   title: string;
//   href: string;
//   icon: React.ComponentType<{ className?: string }>;
// }

// const navItems: NavItem[] = [
//   { title: "Dashboard", href: "/admin/dashboard", icon: MdDashboard },
//   { title: "User Management", href: "/admin/course-management", icon: FaRegUser },
//   {
//     title: "Venue Management",
//     href: "/admin/user-management",
//     icon: PiBuildingApartmentFill,
//   },
//   {
//     title: "All Payment",
//     href: "/admin/all-payment",
//     icon: SlCalender,
//   },
//   {
//     title: "Reports & Analytics",
//     href: "/admin/report-analysis",
//     icon: SiSimpleanalytics,
//   },

//   {
//     title: "Platform Settings",
//     href: "/admin/subscription-plan",
//     icon: IoSettingsOutline,
//   },
// ];

// const AdminLayout = ({ children }: { children: React.ReactNode }) => {
//   const pathname = usePathname();
//   const [collapsed, setCollapsed] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const dispatch = useAppDispatch();
//   const router = useRouter();

//   const handleLogout = () => {
//     cookies.remove("token");
//     dispatch(logOut());
//     toast.success("Admin Logged out successfully!");
//     router.push("/");
//   };
//   const hideNavBar =
//     pathname === "/admin/active-user-details" ||
//     pathname === "/admin/user-payment" ||
//     pathname === "/admin/memnoy-refund/" ||
//     pathname.startsWith("/admin/all-payment/") ||
//     pathname.startsWith("/admin/memnoy-refund") ||
//     pathname.startsWith("/admin/user-management/");

//   return (
//     <div className="flex flex-col min-h-screen bg-[#F4F4F4] overflow-hidden ">
//       <div className="flex flex-col md:flex-row h-screen overflow-hidden">
//         {/* Sidebar for Desktop */}
//         <motion.aside
//           initial={false}
//           animate={{ width: collapsed ? 80 : 296 }}
//           transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
//           className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-20 bg-[var(--color-purPole)] dark:bg-gray-900 shadow-md p-4"
//         >
//           <div className="flex items-center justify-between mb-6 h-[48px] ">
//             <div className="flex items-center gap-2 ">
//               <div className="w-[42px] h-[46px]">
//                 <Image src={logo} alt="Logo" width={52} height={52} />
//               </div>
//               {!collapsed && (
//                 <h1 className="text-[28px] font-bold leading-normal font-['Sansita_Swashed'] bg-gradient-to-b from-[#408DF0] to-[#0E579E] text-transparent bg-clip-text">
//                   Great2d
//                 </h1>
//               )}
//             </div>

//             <button
//               onClick={() => setCollapsed(!collapsed)}
//               className="text-3xl text-[var(--color-textThree)]  cursor-pointer"
//             >
//               {collapsed ? <RiArrowRightSLine /> : <RiArrowLeftSLine />}
//             </button>
//           </div>

//           <nav className="flex-grow space-y-4">
//             {navItems.map((item) => (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   "flex items-center gap-4 px-[14px] py-3 rounded transition text-[var(--color-textThree)]",
//                   pathname.startsWith(item.href)
//                     ? "bg-[var(--color-accent)] text-white"
//                     : "hover:bg-gray-200 dark:hover:bg-[var(--color-textThree)]"
//                 )}
//               >
//                 <item.icon className="h-5 w-5 shrink-0 font-Robot font-[20px]" />
//                 {!collapsed && <span>{item.title}</span>}
//               </Link>
//             ))}
//           </nav>

//           <div className="mt-auto mb-20">
//             <Button
//               variant="destructive"
//               className={cn(
//                 "w-full justify-start gap-3 cursor-pointer",
//                 collapsed
//                   ? "bg-white hover:bg-gray-100 px-2 py-2"
//                   : "bg-white hover:bg-gray-100"
//               )}
//               onClick={handleLogout}
//             >
//               <TbLogout className="h-6 w-6 text-red-600" />
//               {!collapsed && (
//                 <span className="text-black font-Robot">Log Out</span>
//               )}
//             </Button>
//           </div>
//         </motion.aside>

//         {/* Mobile Topbar */}
//         <div className="md:hidden sticky top-0 z-20 bg-[var(--color-purPole)] shadow-sm flex justify-between items-center px-4 py-3">
//           <Image src={logo} alt="Logo" width={40} height={40} />
//           <div className="flex items-center gap-4">
//             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//               <Image
//                 src={profile}
//                 alt="Profile"
//                 width={36}
//                 height={36}
//                 className="rounded-full"
//               />
//             </button>
//           </div>
//         </div>

//         {/* Mobile Drawer */}
//         <AnimatePresence>
//           {mobileMenuOpen && (
//             <motion.div
//               initial={{ x: "-100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "-100%" }}
//               transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
//               className="fixed inset-0 z-30 bg-black bg-opacity-40 flex"
//             >
//               <aside className="bg-white w-64 h-full p-4 space-y-4 shadow-lg relative">
//                 <button
//                   className="absolute top-3 right-3 text-[var(--color-textThree)]"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   ✕
//                 </button>
//                 <div className="flex flex-col items-center gap-2 mb-4">
//                   <Image
//                     src={profile}
//                     alt="Profile"
//                     width={60}
//                     height={60}
//                     className="rounded-full"
//                   />
//                   <h2 className="font-semibold text-lg">Admin Panel</h2>
//                 </div>
//                 <nav className="space-y-1">
//                   {navItems.map((item) => (
//                     <Link
//                       key={item.href}
//                       href={item.href}
//                       onClick={() => setMobileMenuOpen(false)}
//                       className={cn(
//                         "flex items-center gap-3 px-4 py-2 rounded transition",
//                         pathname === item.href
//                           ? "bg-[var(--color-accent)] text-white"
//                           : "hover:bg-gray-200"
//                       )}
//                     >
//                       <item.icon className="h-5 w-5" />
//                       <span>{item.title}</span>
//                     </Link>
//                   ))}
//                 </nav>

//                 <Button
//                   variant="destructive"
//                   className="w-full justify-start gap-3 mt-80"
//                   onClick={() => {
//                     setMobileMenuOpen(false);
//                     alert("Logout");
//                   }}
//                 >
//                   <TbLogout className="h-6 w-6 text-red-600" />
//                   <span className="text-black">Log Out</span>
//                 </Button>
//               </aside>
//               <div
//                 className="flex-1"
//                 onClick={() => setMobileMenuOpen(false)}
//               ></div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Main Content */}
//         <main
//           className={cn(
//             "flex-1 bg-base-200 overflow-y-auto transition-all duration-300",
//             collapsed ? "md:ml-[80px]" : "md:ml-[296px]"
//           )}
//         >
//           {!hideNavBar && (
//             <div className="hidden md:block sticky top-0 z-10">
//               <AdminNavBar />
//             </div>
//           )}
//           <div>{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;
