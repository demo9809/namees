import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return new Response("Missing fields", { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response("User already exists", { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return new Response(JSON.stringify({ user: { id: user.id, email: user.email, name: user.name } }), { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response("Internal error", { status: 500 });
  }
}
