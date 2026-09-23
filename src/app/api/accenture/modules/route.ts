import { NextResponse } from "next/server";
import { ACCENTURE_MODULES } from "@/lib/accentureModuleDefs";


export async function GET() {
  try {
    return NextResponse.json(
      {
        modules: ACCENTURE_MODULES,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", // Cache for 1 hour, serve stale for 1 day
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch modules", details: error?.message },
      { status: 500 }
    );
  }
}