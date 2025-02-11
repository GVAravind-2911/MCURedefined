import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"
import { drizzle } from 'drizzle-orm/libsql'
import bcrypt from "bcrypt"
import { users } from '../../../../../db/schema'
import { eq } from "drizzle-orm"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTHTOKEN
})

const db = drizzle(client)

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const exists = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (exists.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
    })

    return NextResponse.json(
      { success: true },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    )
  }
}