import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role?: string;
  [key: string]: any;
}

export const middleware = (request: NextRequest) => {
  const token = request.cookies.get("token")?.value;
  
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      // Decode token to check user role
      const decoded = jwtDecode<DecodedToken>(token);
      const userRole = decoded.role?.toUpperCase();

      // Only allow admin role to access admin routes (case-insensitive)
      if (userRole !== "ADMIN") {
        // Clear invalid token and redirect
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("token");
        return response;
      }
    } catch (error) {
      // If token is invalid, redirect to login and clear token
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/admin/:path*"],
};
