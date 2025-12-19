import jwt from "jsonwebtoken";
import db from "./db";

export async function verifyAdmin(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;

  const token = auth.replace("Bearer ", "");
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  const [[admin]]: any = await db.query(
    "SELECT id, role FROM admins WHERE id = ?",
    [decoded.id]
  );

  return admin || null;
}
