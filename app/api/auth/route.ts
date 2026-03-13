import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = (body.password ?? "") as string;
    const correctPassword = process.env.AUTH_PASSWORD?.trim() ?? "";
    const sessionToken = process.env.AUTH_SECRET?.trim() ?? "";

    if (!correctPassword || !sessionToken) {
      return NextResponse.json({ error: "Auth not configured", hasPassword: !!correctPassword, hasSecret: !!sessionToken }, { status: 500 });
    }

    if (password.trim() !== correctPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth-token", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth-token", "", { maxAge: 0, path: "/" });
  return res;
}
