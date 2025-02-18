import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@libsql/client"
import { drizzle } from 'drizzle-orm/libsql'
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from 'drizzle-orm'
import bcrypt from "bcryptjs"
import { users } from '@/db/schema'

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTHTOKEN) {
  throw new Error('Database credentials not found')
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTHTOKEN
})

const db = drizzle(client)

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      type?: string;
    }
  }

  interface JWT{
    id?: string;
    type?: string;
  }

  interface User {
    id?: string;
    name?: string;
    email?: string;
    type?: string;
  }
}

export const {auth, handlers, signIn, signOut} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1)

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            type: user.accountType
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: '/auth',
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = user.type;
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.type = token.type as string
      }
      return session
    },
    authorized: ({ request,auth }) => {
      const pathname = request.nextUrl.pathname
      // Allow access to auth page without token
      if (pathname === '/auth') {
        return true
      }
      // Require token for all other protected routes
      return !!auth
    },
  }
})