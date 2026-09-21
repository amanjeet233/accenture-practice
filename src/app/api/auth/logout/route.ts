import { NextRequest, NextResponse } from "next/server";
import {
  destroySession,
  extractSessionIdFromHeader,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const sessionId =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      extractSessionIdFromHeader(req.headers.get("cookie"));

    if (sessionId) {
      await destroySession(sessionId);
    }

    const response = NextResponse.json({
      success: true,
      message: "Successfully logged out.",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error during logout." },
      { status: 500 }
    );
  }
}
