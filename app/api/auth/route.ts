import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function computeToken(password: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correctPassword = process.env.AUTH_PASSWORD?.trim();
  const secret = process.env.AUTH_SECRET?.trim();

  if (!correctPassword || !secret) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  if (password !== correctPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = computeToken(password, secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth-token", "", { maxAge: 0, path: "/" });
  return res;
}
