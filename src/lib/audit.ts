import { headers } from "next/headers";
import { db as prisma } from "@/lib/db";

export async function logAudit({
  userId,
  action,
  module,
  oldData,
  newData,
}: {
  userId?: string | null;
  action: string;
  module: string;
  oldData?: any;
  newData?: any;
}) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null;
    const userAgent = headersList.get("user-agent") || null;

    // Convert oldData/newData to clean JSON objects if they exist
    const parsedOld = oldData ? JSON.parse(JSON.stringify(oldData)) : null;
    const parsedNew = newData ? JSON.parse(JSON.stringify(newData)) : null;

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        module,
        oldData: parsedOld,
        newData: parsedNew,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
  }
}
