import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET as string;

export type AuthRole = "admin" | "staff" | "user";

export type AuthUser = {
  id: number;
  role: AuthRole;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();

    const adminToken = cookieStore.get("admin_token")?.value;
    const userToken = cookieStore.get("user_token")?.value;

    const token = adminToken || userToken;
    if (!token) return null;

    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function requireRole(
  roles: AuthRole[]
): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user || !roles.includes(user.role)) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}
