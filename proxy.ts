import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect dashboard, document management, quizzes, and specific subroutes
  matcher: [
    "/dashboard/:path*",
    "/documents/:path*",
    "/quizzes/:path*",
    "/quiz/:path*",
  ],
};
