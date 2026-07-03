import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

async function ensureAdminUser(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) return null;
  if (email !== expectedEmail || password !== expectedPassword) return null;

  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    if (!existing.passwordHash || existing.role !== "SUPER_ADMIN") {
      return db.user.update({
        where: { id: existing.id },
        data: {
          name: existing.name ?? process.env.ADMIN_NAME ?? "NOVYTAS Admin",
          role: "SUPER_ADMIN",
          passwordHash: await bcrypt.hash(password, 12)
        }
      });
    }

    return existing;
  }

  return db.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME ?? "NOVYTAS Admin",
      role: "SUPER_ADMIN",
      passwordHash: await bcrypt.hash(password, 12)
    }
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  session: {
    strategy: "jwt"
  },

  pages: {
    signIn: "/admin/login"
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        try {
          // 1. Validate input
          const parsed = loginSchema.safeParse(credentials);

          if (!parsed.success) {
            console.error("Invalid credentials format:", parsed.error.flatten());
            return null;
          }

          const normalizedEmail = parsed.data.email.toLowerCase().trim();
          const normalizedPassword = parsed.data.password;

          // 2. Ensure the expected admin user exists and has the right password
          const adminUser = await ensureAdminUser(normalizedEmail, normalizedPassword);

          // 3. Find user
          const user = adminUser ?? await db.user.findUnique({
            where: { email: normalizedEmail }
          });

          if (!user) {
            console.error("User not found");
            return null;
          }

          if (!user.passwordHash) {
            console.error("Missing password hash");
            return null;
          }

          // 4. Check password
          const valid = await bcrypt.compare(
            normalizedPassword,
            user.passwordHash
          );

          if (!valid) {
            console.error("Invalid password");
            return null;
          }

          // 5. Return safe user object
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role ?? "USER"
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = String(token.role ?? "USER");
      }

      return session;
    }
  }
});