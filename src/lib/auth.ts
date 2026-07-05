import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing-google-client-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        let dbUser = await db.user.findUnique({ where: { email: user.email } });
        
        if (!dbUser) {
           const baseSlug = (user.name || "user").toLowerCase().replace(/[^a-z0-9]+/g, '-');
           let slug = baseSlug;
           let counter = 1;
           while (await db.user.findUnique({ where: { slug } })) {
             slug = `${baseSlug}-${counter}`;
             counter++;
           }
           
           dbUser = await db.user.create({
             data: {
               name: user.name || "Google User",
               email: user.email,
               role: "AUTHOR",
               slug,
             }
           });
        }
        
        // Mutate the user object so the jwt callback can use dbUser's id, role, and name
        user.id = dbUser.id;
        (user as import("next-auth").User & { role?: UserRole }).role = dbUser.role;
        user.name = dbUser.name;
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as import("next-auth").User & { role?: UserRole }).role as UserRole;
      }
      
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default-secret-key-change-in-production",
};
