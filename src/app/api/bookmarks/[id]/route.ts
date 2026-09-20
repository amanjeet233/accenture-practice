import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/dto";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.bookmark.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError("Bookmark not found", 404);
    }

    await prisma.bookmark.delete({
      where: { id },
    });

    return apiSuccess({ deleted: true, id });
  } catch (error: any) {
    console.error("DELETE /api/bookmarks/[id] error:", error);
    return apiError("Failed to delete bookmark", 500, error.message);
  }
}
