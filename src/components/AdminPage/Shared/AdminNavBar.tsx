"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUserCheck } from "react-icons/fa6";

import { TbLogout } from "react-icons/tb";
import profile from "../../../assets/images/profile.png";
import { useAppDispatch } from "@/redux/hooks/redux-hook";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import cookies from "js-cookie";
import { logOut } from "@/redux/features/auth/authSlice";

const AdminNavBar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    cookies.remove("token");
    dispatch(logOut());
    toast.success("Admin Logged out successfully!");
    router.push("/");
  };

  return (
    <div className="w-full px-4 md:px-10 py-4 mx-auto h-full bg-[#166E55] pt-2">
      <div className="w-full mt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          {/* Notification & Profile */}
          <div className="flex items-center justify-center gap-4 relative ml-auto">
            <div
              className="h-10 w-10 rounded-full overflow-hidden cursor-pointer"
              onClick={toggleDropdown}
            >
              <Image src={profile} alt="Profile" height={40} width={40} />
            </div>
            {isDropdownOpen && (
              <div className="absolute top-14 right-0 w-56 bg-white border border-gray-200 shadow-md rounded-md z-50 py-2 transition-all duration-200 ease-in-out">
                <Link
                  href="/admin/admin-profile"
                  className="flex items-center gap-3 px-5 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150"
                >
                  <FaUserCheck className="text-gray-600 text-lg" />
                  <span>Profile</span>
                </Link>

                <div className="my-1 border-t border-gray-100"></div>

                <Link
                  onClick={() => {
                    handleLogout();
                  }}
                  href="#"
                  className="flex items-center gap-3 px-5 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150"
                >
                  <TbLogout className="text-red-500 text-lg" />
                  <span>Log Out</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar;

/* 


"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { IoIosSearch, IoMdNotificationsOutline } from "react-icons/io";
import profile from "../../../assets/images/profile.png";
import { FaUserCheck } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { fetchGlobalSearch } from "@/redux/features/search/searchSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";

const AdminNavBar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dispatch = useAppDispatch();
  const { results } = useAppSelector((state) => state.search);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() !== "") dispatch(fetchGlobalSearch(query));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, dispatch]);

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  return (
    <div className="w-full px-10 py-4 mx-auto h-full bg-[#003366]/20 backdrop-blur-lg pt-2">
      <div className="w-full mt-2">
        <div className="flex sm:flex-row items-start justify-between gap-4 sm:gap-0">
        
          <div className="px-2 w-full flex flex-col justify-start">
            <div className="relative">
              <div className="w-full max-w-[782px] h-[44px] bg-white border border-gray-300 rounded-[10px] px-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 flex-grow">
                  <IoIosSearch size={20} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full outline-none bg-transparent text-sm md:text-base placeholder:text-gray-400"
                  />
                </div>
              </div>

            
              {query && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-w-[782px] bg-white border border-gray-300 rounded-md shadow-md">
                  <ul className="divide-y divide-gray-200">
                    {results.map((item: any, idx) => (
                      <li
                        key={idx}
                        className="p-3 hover:bg-gray-100 cursor-pointer"
                      >
                        {item.name || item.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

       
          <div className="flex items-center justify-center gap-4 relative ml-auto">
            <button className="btn btn-primary text-black h-10 w-10 flex items-center justify-center">
              <IoMdNotificationsOutline size={25} />
            </button>
            <div
              className="h-10 w-10 rounded-full overflow-hidden cursor-pointer"
              onClick={toggleDropdown}
            >
              <Image src={profile} alt="Profile" height={40} width={40} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-14 right-0 w-48 bg-white shadow-lg rounded-lg z-50 py-2 transition-all duration-200 ease-in-out">
                <button className="w-full px-5 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <FaUserCheck className="text-lg" />
                    <span>Profile</span>
                  </div>
                </button>
                <button className="w-full px-5 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <IoSettingsOutline className="text-lg" />
                    <span>Settings</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar; */
