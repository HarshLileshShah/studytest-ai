import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    Credentials({
      id: "demo",
      name: "Demo Account",
      credentials: {},
      async authorize() {
        return {
          id: "demo-user-001",
          name: "Demo Student",
          email: "demo@studytest.ai",
          image: "https://api.dicebear.com/7.x/bottts/svg?seed=studytest",
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isPublicRoute =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname.startsWith("/public") ||
        isApiAuthRoute;

      if (!isPublicRoute && !isLoggedIn) {
        return false; // Redirect to /login
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
