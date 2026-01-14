/* eslint-disable @typescript-eslint/no-explicit-any */
// LoginForm.tsx
"use client";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/auth/authSlice";
import { Loader } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/redux/types/venue.type";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role?: string;
  [key: string]: any;
}

const LoginForm = () => {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  // Check if user is already logged in as admin
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const userRole = (decoded.role || "").toUpperCase().trim();
        if (userRole === "ADMIN") {
          // Already logged in as admin, redirect to dashboard
          router.push("/admin/dashboard");
        } else {
          // Not admin, clear token and stay on login page
          console.log("Non-admin token detected, clearing:", userRole);
          Cookies.remove("token");
        }
      } catch (error) {
        // Invalid token, clear it
        console.error("Invalid token in login page:", error);
        Cookies.remove("token");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear any existing token before login attempt
    Cookies.remove("token");
    
    const form = e.target as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;

    const loginData = { email, password };

    try {
      const response = await login(loginData).unwrap();

      // Validate response exists
      if (!response?.user || !response?.access_token) {
        toast.error("Invalid login response. Please try again.");
        return;
      }

      // First check: Validate role from response (case-insensitive)
      const userRoleFromResponse = (response.user.role || "").toUpperCase().trim();
      
      // Second check: Decode JWT token to verify role in token
      let userRoleFromToken: string = "";
      try {
        const decoded = jwtDecode<DecodedToken>(response.access_token);
        userRoleFromToken = (decoded.role || "").toUpperCase().trim();
      } catch (decodeError) {
        console.error("Token decode error:", decodeError);
        toast.error("Invalid token received. Please try again.");
        Cookies.remove("token");
        return;
      }

      // Strict validation: BOTH response and token must have ADMIN role
      const isAdmin = userRoleFromResponse === "ADMIN" && userRoleFromToken === "ADMIN";
      
      if (!isAdmin) {
        console.log("Login blocked - Role check failed:", {
          responseRole: userRoleFromResponse,
          tokenRole: userRoleFromToken,
          originalResponseRole: response.user.role
        });
        toast.error("Access denied. Only administrators can login to this dashboard.");
        // Ensure no token is set
        Cookies.remove("token");
        return;
      }

      // Only proceed if role is ADMIN (this point should never be reached if role is not ADMIN)
      // Map API response to your User type
      const user: User = {
        id: response.user.userId, // Map userId to id
        email: response.user.email,
        fullName: response.user.fullName,
        role: response.user.role,
        currentSubscription: response.user.currentSubscription,
      };

      // Set token in cookies
      Cookies.set("token", response.access_token, { expires: 1 }); // expires in 1 day

      // Dispatch user data to Redux store
      dispatch(
        setUser({
          user: user,
          token: response.access_token,
        })
      );

      // Redirect to dashboard
      router.push("/admin/dashboard");
      toast.success("Login Successful");
    } catch (error: any) {
      console.error("Login error details:", error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.status === 404) {
        toast.error("API endpoint not found. Please check the backend.");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="w-full bg-white text-[#FDFCEE] font-Robot">
      <div className="flex items-center justify-center h-screen p-3">
        <div className="w-full max-w-md space-y-10">
          <h1 className="text-4xl sm:text-5xl font-semibold text-center text-black">
            Admin Login
          </h1>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="flex flex-col space-y-3">
              <label className="text-sm sm:text-[17px] text-black">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your mail"
                className="py-2 px-5 sm:py-2.5 sm:px-6 rounded-[12px] border-2 border-gray-300 focus:border-blue-400 focus:outline-none transition bg-gray-100 text-gray-800"
                required
                defaultValue="" // For testing
              />
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-sm sm:text-[17px] text-black">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                className="py-2 px-5 sm:py-2.5 sm:px-6 rounded-[12px] border-2 border-gray-300 focus:border-blue-400 focus:outline-none transition bg-gray-100 text-gray-800"
                required
                minLength={6}
                defaultValue="" // For testing
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full py-5.5 px-5 sm:px-6 text-[16px] sm:text-lg cursor-pointer bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white transition-colors duration-200 rounded-lg flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin w-5 h-5" />
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
