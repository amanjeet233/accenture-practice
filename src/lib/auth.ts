import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "codertrack_session";
export const SESSION_MAX_AGE_DAYS = 30;
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  roleId?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
}

/**
 * Hash a plain text password using BCrypt with salt rounds = 10.
 * Never stores or logs plain text passwords.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain text password against a stored BCrypt password hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new server-side session in the database.
 * Strictly stores only the session ID and userId with an expiration date.
 */
export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS);

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  });

  return {
    id: session.id,
    expiresAt: session.expiresAt,
  };
}

/**
 * Invalidate/delete a session from the database.
 */
export async function destroySession(sessionId: string): Promise<void> {
  try {
    await prisma.session.delete({
      where: { id: sessionId },
    });
  } catch {
    // If session is already deleted, ignore error
  }
}

/**
 * Extract session ID from cookie header string.
 */
export function extractSessionIdFromHeader(cookieHeader?: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Retrieve the current authenticated user from server-side session.
 * Supports both Route Handlers (NextRequest/Request) and Server Components (next/headers cookies()).
 * NEVER trusts client-supplied userIds.
 */
export async function getSessionUser(req?: Request | NextRequest): Promise<SafeUser | null> {
  let sessionId: string | null = null;

  // 1. Try extracting from Request object if provided
  if (req) {
    const cookieHeader = req.headers.get("cookie");
    sessionId = extractSessionIdFromHeader(cookieHeader);
  }

  // 2. Fall back to Next.js cookies() API
  if (!sessionId) {
    try {
      const cookieStore = await cookies();
      sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
    } catch {
      // In contexts where cookies() is unavailable, sessionId remains null
    }
  }

  if (!sessionId) {
    return null;
  }

  // Query database for active, non-expired session
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          roleId: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    // Cleanup expired session asynchronously
    prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    return null;
  }

  return session.user;
}

/**
 * Require an authenticated session user.
 * Throws an Error or returns null if not authenticated.
 */
export async function requireSessionUser(req?: Request | NextRequest): Promise<SafeUser> {
  const user = await getSessionUser(req);
  if (!user) {
    throw new Error("Authentication required. Please log in.");
  }
  return user;
}
